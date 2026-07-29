const test = require("node:test");
const assert = require("node:assert/strict");

process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-key";
process.env.GOOGLE_SERVICE_ACCOUNT_KEY =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
  JSON.stringify({ client_email: "test@example.com", private_key: "test" });

const { ensureOffset, assertBookableWindow } = require("../lib/calendar");

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

// 2026-07-30 is a Thursday in Europe/Athens; 2026-08-01/02 are Sat/Sun.
test("assertBookableWindow allows a 30-minute slot on a weekday within business hours", () => {
  assert.doesNotThrow(() =>
    assertBookableWindow("2026-07-30T10:00:00+03:00", "2026-07-30T10:30:00+03:00")
  );
});

test("assertBookableWindow allows the last bookable slot of the day (ends exactly at closing)", () => {
  assert.doesNotThrow(() =>
    assertBookableWindow("2026-07-30T19:30:00+03:00", "2026-07-30T20:00:00+03:00")
  );
});

test("assertBookableWindow rejects a weekend booking", () => {
  assert.throws(
    () => assertBookableWindow("2026-08-01T12:00:00+03:00", "2026-08-01T12:30:00+03:00"),
    /Monday–Friday/
  );
});

test("assertBookableWindow rejects a slot starting before opening hours", () => {
  assert.throws(
    () => assertBookableWindow("2026-07-30T09:30:00+03:00", "2026-07-30T10:00:00+03:00"),
    /between 10:00 and 20:00/
  );
});

test("assertBookableWindow rejects a slot starting after the last bookable start", () => {
  assert.throws(
    () => assertBookableWindow("2026-07-30T19:45:00+03:00", "2026-07-30T20:15:00+03:00"),
    /between 10:00 and 20:00/
  );
});

test("assertBookableWindow rejects a duration other than 30 minutes", () => {
  assert.throws(
    () => assertBookableWindow("2026-07-30T10:00:00+03:00", "2026-07-30T11:00:00+03:00"),
    /exactly 30 minutes/
  );
});

test("assertBookableWindow resolves a bare (offset-less) datetime as Athens local time before checking the window", () => {
  // 2026-07-30T10:00:00 with no offset means 10:00 Athens time, which is in-window.
  assert.doesNotThrow(() => assertBookableWindow("2026-07-30T10:00:00", "2026-07-30T10:30:00"));
});
