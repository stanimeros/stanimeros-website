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
  await sessionDoc(sessionId).set(
    {
      closed: false,
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

async function markClosed(sessionId) {
  await sessionDoc(sessionId).set(
    { closed: true, closedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

// Sessions with activity, not yet closed, whose last message is older than `staleBefore`.
async function getStaleOpenSessions(staleBefore) {
  const snap = await db
    .collection("chatSessions")
    .where("closed", "==", false)
    .where("lastMessageAt", "<=", staleBefore)
    .get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

module.exports = {
  appendMessage,
  getHistory,
  markClosed,
  getStaleOpenSessions,
};
