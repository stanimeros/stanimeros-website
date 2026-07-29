const test = require("node:test");
const assert = require("node:assert/strict");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
process.env.GOOGLE_SERVICE_ACCOUNT_KEY =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
  JSON.stringify({ client_email: "test@example.com", private_key: "test" });

const { ensureOffset } = require("../lib/calendar");

// Regression test: the model previously sent bare datetimes like
// "2026-07-30T15:00:00" (no UTC offset) straight to Google's freebusy API,
// which rejects them with a 400 — the underlying cause of the chat's
// "I'm having trouble checking availability" failure.
test("ensureOffset appends the Athens summer (EEST) offset to a bare datetime", () => {
  assert.equal(ensureOffset("2026-07-30T15:00:00"), "2026-07-30T15:00:00+03:00");
});

test("ensureOffset appends the Athens winter (EET) offset to a bare datetime", () => {
  assert.equal(ensureOffset("2026-01-15T15:00:00"), "2026-01-15T15:00:00+02:00");
});

test("ensureOffset leaves a datetime that already has 'Z' untouched", () => {
  assert.equal(ensureOffset("2026-07-30T12:00:00Z"), "2026-07-30T12:00:00Z");
});

test("ensureOffset leaves a datetime that already has an explicit offset untouched", () => {
  assert.equal(ensureOffset("2026-07-30T15:00:00+03:00"), "2026-07-30T15:00:00+03:00");
});
