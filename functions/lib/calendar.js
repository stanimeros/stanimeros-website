const { google } = require("googleapis");

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || "primary";

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
      timeMin: startTime,
      timeMax: endTime,
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
      start: { dateTime: startTime },
      end: { dateTime: endTime },
    },
  });
  return { eventId: res.data.id, htmlLink: res.data.htmlLink };
}

module.exports = { checkAvailability, createBooking };
