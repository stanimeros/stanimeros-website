const test = require("node:test");
const assert = require("node:assert/strict");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || "test-project";

const { _internal } = require("../index");
const { formatTranscript, toGeminiContents, runTool } = _internal;

test("formatTranscript labels user/model turns as Visitor/Agent and escapes HTML", () => {
  const out = formatTranscript([
    { role: "user", text: "<b>Νίκος</b>" },
    { role: "model", text: "Hi there" },
  ]);
  assert.equal(out, "Visitor: &lt;b&gt;Νίκος&lt;/b&gt;\nAgent: Hi there");
});

test("toGeminiContents maps 'model' role through and everything else to 'user'", () => {
  const out = toGeminiContents([
    { role: "user", text: "hi" },
    { role: "model", text: "hello" },
  ]);
  assert.deepEqual(out, [
    { role: "user", parts: [{ text: "hi" }] },
    { role: "model", parts: [{ text: "hello" }] },
  ]);
});

test("runTool routes checkAvailability/createBooking calls to the injected deps", async () => {
  const calls = [];
  const deps = {
    checkAvailability: async (start, end) => {
      calls.push(["checkAvailability", start, end]);
      return { busy: [] };
    },
    createBooking: async (args) => {
      calls.push(["createBooking", args]);
      return { eventId: "abc", htmlLink: "https://example.com" };
    },
  };

  const availability = await runTool(
    { name: "checkAvailability", args: { startTime: "2026-07-30T12:00:00Z", endTime: "2026-07-30T13:00:00Z" } },
    deps
  );
  assert.deepEqual(availability, { busy: [] });

  const booking = await runTool(
    { name: "createBooking", args: { name: "Nikos", email: "test@nikos.gr", purpose: "app", startTime: "x", endTime: "y" } },
    deps
  );
  assert.deepEqual(booking, { eventId: "abc", htmlLink: "https://example.com" });

  assert.equal(calls.length, 2);
});

test("runTool returns an error object for an unknown tool name instead of throwing", async () => {
  const result = await runTool({ name: "deleteEverything", args: {} }, {});
  assert.deepEqual(result, { error: "Unknown tool: deleteEverything" });
});

// Regression test for the bug this session was reporting: a bad/relative date
// (or any other downstream failure) reaching checkAvailability/createBooking
// must come back as a tool result the model can react to, not an exception
// that aborts the whole chat turn with a generic "something went wrong".
test("runTool catches a dependency throw and returns it as an {error} tool result", async () => {
  const deps = {
    checkAvailability: async () => {
      throw new Error("Invalid time value");
    },
    createBooking: async () => {
      throw new Error("should not be called");
    },
  };

  const result = await runTool(
    { name: "checkAvailability", args: { startTime: "αύριο στις 15:00", endTime: "" } },
    deps
  );

  assert.equal(result.error, "Tool checkAvailability failed: Invalid time value");
});
