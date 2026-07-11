const jwt = require("jsonwebtoken");
const { isBlocked } = require("../Utils/tokenBlocklist");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

/** Create a signed JWT for a user. */
function signToken(user) {
  return jwt.sign(
    { id: String(user._id), email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * Express middleware: require a valid `Authorization: Bearer <token>` header.
 * On success attaches `req.user = { id, email }`. On failure responds 401.
 */
function protect(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return res
      .status(401)
      .json({ msg: "Authentication required. Please log in." });
  }

  if (isBlocked(token)) {
    return res
      .status(401)
      .json({ msg: "You have been logged out. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    // Expose the raw token + its expiry so handlers (e.g. logout) can revoke it.
    req.token = token;
    req.tokenExp = decoded.exp;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ msg: "Invalid or expired token. Please log in again." });
  }
}

module.exports = { signToken, protect, JWT_SECRET, JWT_EXPIRES };
