/**
 * Very small in-memory session store for interview conversations.
 *
 * The original code kept a single global `ChatHistory` / `question` array, which
 * meant every concurrent user shared (and corrupted) the same interview. Here we
 * key state by a sessionId so multiple interviews can run at once.
 *
 * The frontend can send a `sessionId` (body, query, or `x-session-id` header).
 * If none is provided we fall back to "default" so existing clients keep working.
 *
 * Sessions expire after SESSION_TTL_MS of inactivity to avoid leaking memory.
 */
const SESSION_TTL_MS = 1000 * 60 * 60; // 1 hour

const store = new Map();

function resolveSessionId(req) {
  return (
    // A logged-in user gets a session keyed to their account automatically.
    (req.user && req.user.id) ||
    (req.body && req.body.sessionId) ||
    req.query.sessionId ||
    req.get("x-session-id") ||
    "default"
  );
}

function getSession(req, { create = true } = {}) {
  const id = resolveSessionId(req);
  let session = store.get(id);

  if (!session && create) {
    session = {
      id,
      email: null,
      course: null,
      history: [], // OpenAI-style [{ role, content }]
      questions: [], // list of asked question strings
      createdAt: Date.now(),
    };
    store.set(id, session);
  }

  if (session) session.lastActive = Date.now();
  return session;
}

function resetSession(req) {
  const session = getSession(req, { create: true });
  session.history = [];
  session.questions = [];
  return session;
}

// Periodic cleanup of stale sessions.
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of store.entries()) {
    if (now - (s.lastActive || s.createdAt) > SESSION_TTL_MS) {
      store.delete(id);
    }
  }
}, 1000 * 60 * 10).unref?.();

module.exports = { getSession, resetSession, resolveSessionId, store };
