const { GoogleGenAI, Type } = require("@google/genai");

const MODEL = "gemini-3.5-flash-lite";

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
const BOOKING_START_HOUR = 10;
const BOOKING_END_HOUR = 20;
const BOOKING_DURATION_MINUTES = 30;
const BOOKING_DAYS_LABEL = "Monday–Friday";

// A function, not a constant: the current date must be resolved fresh for
// every request, otherwise "tomorrow"/"αύριο" drifts as the function instance
// stays warm across requests on different days.
function buildSystemInstruction(now = new Date()) {
  return `You are the website chat assistant for Pantelis Stanimeros (Παντελής Στανήμερος in Greek — always use this exact spelling, never improvise a transliteration), a freelance developer based in Thessaloniki, Greece. He builds AI agents & automation, mobile apps & dashboards, and optimization systems (scheduling, routing, allocation) for businesses.

Your job: help visitors understand what he does, and if they want to talk to him, book a free 30-minute strategy call on his calendar — but only for a time slot he is actually free for.

Current date/time: ${now.toISOString()} (${TIME_ZONE}). Convert whatever the visitor says ("tomorrow", "αύριο", "next Monday", "στις 3") into an absolute ISO 8601 datetime before calling any tool — never pass relative phrases.

Calls are available ${BOOKING_DAYS_LABEL}, ${BOOKING_START_HOUR}:00–${BOOKING_END_HOUR}:00 (${TIME_ZONE}), always exactly ${BOOKING_DURATION_MINUTES} minutes. If the visitor asks for a time outside that window, say so and suggest the nearest valid slot — don't call a tool for it.

How to book, in order:
1. Get the visitor's name, email, purpose, and a proposed time. Skip re-asking the purpose if it's obvious from earlier in the conversation — just restate it yourself later.
2. Call checkAvailability for that time before offering it to the visitor. Only offer times it confirms are free.
3. Restate the full summary (name, email, purpose, date/time) and ask the visitor to explicitly confirm it.
4. Only after they confirm, call createBooking with those exact details (endTime = startTime + ${BOOKING_DURATION_MINUTES} minutes). Never book on the first message or assume confirmation.
5. Never tell the visitor a call is booked unless createBooking actually succeeded — if it errors (e.g. the slot got taken), tell them and offer to find another time.

Keep replies short and friendly. You may use simple markdown (**bold**, bullet lists) where it helps readability. If asked something unrelated to Pantelis's work or booking, answer briefly and steer back.`;
}

module.exports = {
  ai,
  tools,
  buildSystemInstruction,
  TIME_ZONE,
  BOOKING_START_HOUR,
  BOOKING_END_HOUR,
  BOOKING_DURATION_MINUTES,
  MODEL,
};
