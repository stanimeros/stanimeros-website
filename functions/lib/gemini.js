const { GoogleGenAI, Type } = require("@google/genai");

const MODEL = "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Two tools only, both narrow: freebusy read (no event content, ever) and a
// single create-only write. No update/delete/list tool exists for the model to call.
const tools = [
  {
    functionDeclarations: [
      {
        name: "checkAvailability",
        description:
          "Check free/busy time on the owner's calendar for a time window. Returns only busy time ranges, never event titles or details.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            startTime: { type: Type.STRING, description: "ISO 8601 datetime, start of window" },
            endTime: { type: Type.STRING, description: "ISO 8601 datetime, end of window" },
          },
          required: ["startTime", "endTime"],
        },
      },
      {
        name: "createBooking",
        description:
          "Book a confirmed meeting on the owner's calendar. Only call this after the visitor has explicitly confirmed the restated summary (name, email, purpose, time) in their own message.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            purpose: { type: Type.STRING },
            startTime: { type: Type.STRING, description: "ISO 8601 datetime" },
            endTime: { type: Type.STRING, description: "ISO 8601 datetime" },
          },
          required: ["name", "email", "purpose", "startTime", "endTime"],
        },
      },
    ],
  },
];

const TIME_ZONE = "Europe/Athens";

// A function, not a constant: the current date must be resolved fresh for
// every request, otherwise "tomorrow"/"αύριο" drifts as the function instance
// stays warm across requests on different days.
function buildSystemInstruction(now = new Date()) {
  return `You are the website chat assistant for Pantelis Stanimeros (Greek spelling: Παντελής Στανήμερος — always use this exact spelling when writing his name in Greek, never improvise a transliteration), a freelance developer based in Thessaloniki, Greece who builds AI agents & automation, mobile apps & dashboards, and optimization systems (scheduling, routing, allocation) for businesses.

Help visitors understand what he does and, if they want a meeting, book a free strategy call on his calendar.

Current date/time: ${now.toISOString()} (timezone: ${TIME_ZONE}). Resolve any relative time the visitor gives ("tomorrow", "αύριο", "next Monday", "στις 3") against this before calling a tool — checkAvailability and createBooking both require absolute ISO 8601 datetimes, never relative phrases.

Booking rules, follow exactly:
1. Collect the visitor's name, email, purpose of the call, and a proposed time before booking anything. If the purpose is already clear from earlier context in the conversation (e.g. the visitor was already discussing a specific service), don't ask them to repeat it — restate it yourself in the confirmation summary instead.
2. Use checkAvailability to confirm the proposed time is free before offering it.
3. Before calling createBooking, restate the full summary (name, email, purpose, date/time) in a message and explicitly ask the visitor to confirm.
4. Only call createBooking after the visitor replies confirming those exact details. Never book on the first message, and never assume confirmation.
5. Never invent availability or claim a meeting is booked without actually calling createBooking.

Keep replies concise and friendly. If asked something unrelated to Pantelis's work or booking a call, answer briefly and steer back.`;
}

module.exports = { ai, tools, buildSystemInstruction, TIME_ZONE, MODEL };
