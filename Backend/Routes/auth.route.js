const express = require("express");
const bcrypt = require("bcryptjs");
const authRoute = express.Router();

const { UserModel } = require("../Models/user.model");
const { dbReady } = require("../Config/db");
const { signToken, protect } = require("../Middleware/auth");
const { block } = require("../Utils/tokenBlocklist");
const { isValidEmail } = require("../Utils/validate");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** Shape the user object we send back (never include the password). */
function publicUser(user) {
  return { id: String(user._id), email: user.email, name: user.name || null };
}

/* --------------------------- POST /auth/register -------------------------- */
authRoute.post(
  "/register",
  asyncHandler(async (req, res) => {
    if (!dbReady()) {
      return res
        .status(503)
        .json({ msg: "Database unavailable. Cannot register right now." });
    }

    const { email, password, name } = req.body || {};

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: "A valid email is required." });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });
    }

    const normalisedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalisedEmail });
    if (existing) {
      return res
        .status(409)
        .json({ msg: "An account with this email already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email: normalisedEmail,
      password: hashed,
      name: typeof name === "string" ? name.trim() : undefined,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  })
);

/* ----------------------------- POST /auth/login --------------------------- */
authRoute.post(
  "/login",
  asyncHandler(async (req, res) => {
    if (!dbReady()) {
      return res
        .status(503)
        .json({ msg: "Database unavailable. Cannot log in right now." });
    }

    const { email, password } = req.body || {};
    if (!isValidEmail(email) || typeof password !== "string" || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    // password has select:false in the schema, so ask for it explicitly.
    const user = await UserModel.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  })
);

/* ------------------------------ GET /auth/me ------------------------------ */
// Returns the current user + their interview history. Requires a valid token.
authRoute.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    if (!dbReady()) {
      return res.status(503).json({ msg: "Database unavailable." });
    }
    const user = await UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found." });
    res.json({ user: publicUser(user), data: user.data || [] });
  })
);

/* ----------------------------- POST /auth/logout -------------------------- */
// Signs the USER out (different from /chat/logout, which ends an interview).
// Revokes the current token so it can no longer be used, even before it expires.
authRoute.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    block(req.token, req.tokenExp);
    res.json({ msg: "Logged out successfully." });
  })
);

module.exports = { authRoute };
