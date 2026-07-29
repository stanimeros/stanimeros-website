const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function sessionDoc(sessionId) {
  return db.collection("chatSessions").doc(sessionId);
}

async function appendMessage(sessionId, { role, text }) {
  await sessionDoc(sessionId).collection("messages").add({
    role,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  // merge:true leaves `booked`/`reported` alone if already set — only the
  // activity timestamp needs to move on every message.
  await sessionDoc(sessionId).set(
    {
      reported: false,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function getHistory(sessionId) {
  const snap = await sessionDoc(sessionId)
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((doc) => doc.data());
}

// Flags a session as converted. Doesn't close/report it — the session still
// naturally goes stale and gets picked up (with this flag) by the next report.
async function markBooked(sessionId) {
  await sessionDoc(sessionId).set({ booked: true }, { merge: true });
}

async function markReported(sessionId) {
  await sessionDoc(sessionId).set(
    { reported: true, reportedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// Sessions with activity, not yet reported, whose last message is older than `staleBefore`.
async function getSessionsToReport(staleBefore) {
  const snap = await db
    .collection("chatSessions")
    .where("reported", "==", false)
    .where("lastMessageAt", "<=", staleBefore)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  appendMessage,
  getHistory,
  markBooked,
  markReported,
  getSessionsToReport,
};
