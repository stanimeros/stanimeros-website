const { setGlobalOptions } = require("firebase-functions");
const { onCall } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

const { sendOwnerEmail, escapeHtml } = require("./lib/mailer");
const { ai, tools, buildSystemInstruction, MODEL } = require("./lib/gemini");
const { checkAvailability, createBooking } = require("./lib/calendar");
const {
  appendMessage,
  getHistory,
  markClosed,
  getStaleOpenSessions,
} = require("./lib/firestoreChat");

setGlobalOptions({ maxInstances: 10 });

const CHAT_TIMEOUT_MINUTES = 15;
const MAX_TOOL_ROUNDS = 3;
const MAX_MESSAGE_LENGTH = 2000;

// Form submission (contact form / package inquiries).
exports.sendEmail = onCall({ enforceAppCheck: true }, async (request) => {
  try {
    const { name, email, message, subject } = request.data;

    if (!name || !email || !message || !subject) {
      throw new Error("Missing required fields");
    }

    await sendOwnerEmail({
      subject,
      html: `
        <h2>${escapeHtml(subject)}</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        <hr>
        <p><em>Sent from your website contact form</em></p>
      `,
    });

    logger.info("Form submission email sent", { name, email });
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    logger.error("Error sending form submission email", error);
    throw new Error("Failed to send email");
  }
});

function formatTranscript(messages) {
  return messages
    .map((m) => `${m.role === "user" ? "Visitor" : "Agent"}: ${escapeHtml(m.text)}`)
    .join("\n");
}

async function sendChatSummaryEmail(sessionId, messages, reason) {
  const subject =
    reason === "booking" ? "Website chat: booking confirmed" : "Website chat ended";
  await sendOwnerEmail({
    subject,
    html: `
      <h2>${escapeHtml(subject)}</h2>
      <p><strong>Session:</strong> ${escapeHtml(sessionId)}</p>
      <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${formatTranscript(messages)}</pre>
    `,
  });
}

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));
}

// Errors are caught and returned as a tool result (never thrown) so a bad
// call — e.g. a malformed date the model produced — becomes something the
// model can recover from ("that time didn't work, try another") instead of
// aborting the whole turn with a generic failure.
async function runTool(call, deps = { checkAvailability, createBooking }) {
  try {
    if (call.name === "checkAvailability") {
      return await deps.checkAvailability(call.args.startTime, call.args.endTime);
    }
    if (call.name === "createBooking") {
      return await deps.createBooking(call.args);
    }
    return { error: `Unknown tool: ${call.name}` };
  } catch (error) {
    logger.error(`Tool ${call.name} failed`, error);
    return { error: `Tool ${call.name} failed: ${error.message}` };
  }
}

// Chat agent. One call = one visitor message in, one agent reply out;
// full history lives in Firestore, keyed by the session id the client generated.
exports.geminiChat = onCall({ enforceAppCheck: true }, async (request) => {
  const { sessionId, message } = request.data;

  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("Missing sessionId");
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    throw new Error("Missing message");
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error("Message too long");
  }

  try {
    await appendMessage(sessionId, { role: "user", text: message });

    const contents = toGeminiContents(await getHistory(sessionId));

    const systemInstruction = buildSystemInstruction();

    let response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction, tools },
    });

    let bookingConfirmed = false;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const call = response.functionCalls?.[0];
      if (!call) break;

      const result = await runTool(call);
      if (call.name === "createBooking" && !result.error) bookingConfirmed = true;

      // Push the model's actual returned content, not a hand-built
      // { functionCall } part — the real part also carries a thoughtSignature
      // (gemini-3.x requires it echoed back on the next turn) and any other
      // fields the model attached, which a reconstructed part would drop.
      contents.push(response.candidates[0].content);
      contents.push({
        role: "user",
        parts: [{ functionResponse: { name: call.name, response: result } }],
      });

      response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: { systemInstruction, tools },
      });
    }

    const reply = response.text ?? "";
    await appendMessage(sessionId, { role: "model", text: reply });

    if (bookingConfirmed) {
      const history = await getHistory(sessionId);
      await sendChatSummaryEmail(sessionId, history, "booking");
      await markClosed(sessionId);
    }

    return { reply };
  } catch (error) {
    logger.error("Error in geminiChat", error);
    throw new Error("Failed to get a response from the chat agent");
  }
});

// Sweeps for chats the visitor abandoned without an explicit booking or goodbye.
exports.chatTimeoutSweep = onSchedule("every 5 minutes", async () => {
  const staleBefore = new Date(Date.now() - CHAT_TIMEOUT_MINUTES * 60 * 1000);
  const staleSessions = await getStaleOpenSessions(staleBefore);

  for (const session of staleSessions) {
    const history = await getHistory(session.id);
    if (history.length === 0) {
      await markClosed(session.id);
      continue;
    }
    await sendChatSummaryEmail(session.id, history, "timeout");
    await markClosed(session.id);
  }

  logger.info(`Chat timeout sweep closed ${staleSessions.length} session(s)`);
});

// Pure helpers, exported for unit testing only — not part of the deployed
// function surface (Firebase only deploys the `exports.<name>` onCall/onSchedule
// entries above).
exports._internal = { formatTranscript, toGeminiContents, runTool };
