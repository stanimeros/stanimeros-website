// Manual credential smoke test — not deployed (see firebase.json functions.ignore).
// Usage: node scripts/test-credentials.js [gemini|calendar|booking|all]
require("dotenv").config({ quiet: true });
const { ai } = require("../lib/gemini");
const { checkAvailability, createBooking } = require("../lib/calendar");

async function testGemini() {
  console.log("Testing Gemini API key...");
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: "Reply with exactly the word: pong" }] }],
  });
  console.log("Gemini OK, reply:", response.text?.trim());
}

async function testCalendarRead() {
  console.log("Testing calendar freebusy read...");
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const result = await checkAvailability(now.toISOString(), endOfDay.toISOString());
  console.log(`Calendar read OK, busy ranges (${result.busy.length}):`, JSON.stringify(result.busy));
}

async function testCalendarBooking() {
  console.log("Testing calendar event creation (writes a real, clearly-labeled test event)...");
  const start = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  start.setMinutes(0, 0, 0);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const result = await createBooking({
    name: "Credential Test",
    email: process.env.GOOGLE_CALENDAR_ID,
    purpose: "[TEST] Credential smoke test — safe to delete",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  });
  console.log("Booking OK:", result.htmlLink);
  console.log("^ Delete this test event from your calendar once verified.");
}

async function main() {
  const mode = process.argv[2] || "all";
  if (mode === "gemini" || mode === "all") await testGemini();
  if (mode === "calendar" || mode === "all") await testCalendarRead();
  if (mode === "booking") await testCalendarBooking();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
