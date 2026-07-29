const { google } = require("googleapis");
const { TIME_ZONE } = require("./gemini");

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

function offsetForZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" }).formatToParts(
    date
  );
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+00:00";
  return tzName.replace("GMT", "") || "+00:00";
}

// The model is instructed to always include a UTC offset, but if it slips and
// sends a bare local datetime (e.g. "2026-07-30T15:00:00"), Google's calendar
// API rejects it outright — RFC3339 requires an offset, and there's no
// well-defined default. A bare datetime from the visitor's chat means
// wall-clock time in TIME_ZONE, so resolve it that way instead of failing the
// whole tool call. Greece observes DST, so the offset isn't fixed — it's
// computed per-date rather than hardcoded.
function ensureOffset(dateTimeString) {
  if (/(Z|[+-]\d{2}:\d{2})$/.test(dateTimeString)) return dateTimeString;
  const approx = new Date(`${dateTimeString}Z`);
  return `${dateTimeString}${offsetForZone(approx, TIME_ZONE)}`;
}

function getCalendarClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    // Narrowest scopes that cover our two operations: read busy/free time and
    // create/read events. Deliberately excludes the broad `calendar` scope,
    // which would also allow creating/deleting calendars and changing sharing.
    scopes: [
      "https://www.googleapis.com/auth/calendar.freebusy",
      "https://www.googleapis.com/auth/calendar.events",
    ],
  });
  return google.calendar({ version: "v3", auth });
}

// Only ever returns busy time ranges — the freebusy API has no concept of
// event titles/descriptions/attendees, so this cannot leak calendar content.
async function checkAvailability(startTime, endTime) {
  const calendar = getCalendarClient();
  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: ensureOffset(startTime),
      timeMax: ensureOffset(endTime),
      items: [{ id: CALENDAR_ID }],
    },
  });
  const busy = res.data.calendars?.[CALENDAR_ID]?.busy ?? [];
  return { busy };
}

// Only ever inserts a new event — there is deliberately no update/delete/list
// exposed here, so this is the sole write path onto the calendar.
//
// Note: a bare service account (no Workspace domain-wide delegation, which only
// applies to Google Workspace accounts, not personal Gmail) cannot add attendees
// to events — Google rejects it. So the visitor's name/email/purpose go in the
// event description instead of as a calendar invite; the visitor is notified via
// our own confirmation email (see functions/index.js), not a Calendar invite.
async function createBooking({ name, email, purpose, startTime, endTime }) {
  const calendar = getCalendarClient();
  const res = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary: `Strategy call: ${name}`,
      description: `Visitor: ${name} <${email}>\n\n${purpose}`,
      start: { dateTime: ensureOffset(startTime) },
      end: { dateTime: ensureOffset(endTime) },
    },
  });
  return { eventId: res.data.id, htmlLink: res.data.htmlLink };
}

module.exports = { checkAvailability, createBooking, ensureOffset };
