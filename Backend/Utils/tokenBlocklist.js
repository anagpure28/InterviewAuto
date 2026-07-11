/**
 * In-memory JWT blocklist for user sign-out.
 *
 * Because JWTs are stateless, "logging out" server-side means remembering which
 * tokens have been revoked until they would have expired anyway. We store each
 * revoked token string with its expiry timestamp and drop it once it's expired.
 *
 * NOTE: this lives in memory, so it resets on server restart (a restart also
 * doesn't matter much — tokens still expire on their own). For multiple server
 * instances you'd move this to Redis.
 */
const blocked = new Map(); // token -> expiry (ms epoch)

/** Revoke a token until `expSeconds` (JWT `exp`, in seconds). */
function block(token, expSeconds) {
  if (!token) return;
  const expMs = expSeconds ? expSeconds * 1000 : Date.now() + 1000 * 60 * 60;
  blocked.set(token, expMs);
}

/** Is this token revoked (and not yet expired)? */
function isBlocked(token) {
  const expMs = blocked.get(token);
  if (!expMs) return false;
  if (Date.now() > expMs) {
    blocked.delete(token);
    return false;
  }
  return true;
}

// Periodically drop expired entries so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [token, expMs] of blocked.entries()) {
    if (now > expMs) blocked.delete(token);
  }
}, 1000 * 60 * 10).unref?.();

module.exports = { block, isBlocked };
