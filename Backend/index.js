const express = require("express");
require("dotenv").config();
const cors = require("cors");

const { connectDB, dbReady } = require("./Config/db");
const { userRoute } = require("./Routes/user.route");
const { authRoute } = require("./Routes/auth.route");
const gemini = require("./Config/gemini");

const app = express();
const PORT = process.env.PORT || 3030;

// CORS — allow the browser frontend (any origin) to call the API, including the
// Authorization header we send on every protected /chat call. Explicitly
// handling OPTIONS ensures the preflight for POSTs with a JSON body + auth
// header always succeeds.
const corsOptions = {
  origin: true, // reflect the request origin (works for localhost:3000, Vercel, etc.)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-session-id"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight for every route

// Body parsing — the frontend sends a few different content types:
//  - JSON              { prompt: "..." }        -> express.json()
//  - raw string        "my answer"              -> axios sends x-www-form-urlencoded
//  - text/plain                                 -> express.text()
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.text({ type: ["text/*"], limit: "1mb" }));

// Health / status endpoint.
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "InterviewAuto backend",
    gemini: gemini.isConfigured() ? gemini.MODEL_NAME : "not configured",
    db: dbReady() ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

app.use("/auth", authRoute);
app.use("/chat", userRoute);

// 404 handler.
app.use((req, res) => {
  res.status(404).json({ msg: `Route not found: ${req.method} ${req.path}` });
});

// Central error handler — keeps the server alive and returns a clean message.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[error]", err.message);
  const status = err.status || 500;
  res.status(status).json({ msg: err.message || "Internal server error" });
});

// Fail fast if the AI key is missing (the whole app depends on it).
if (!gemini.isConfigured()) {
  console.warn(
    "\n[startup] WARNING: Gemini is not configured. Set GEMINI_API_KEY (or AIKey) in Backend/.env\n"
  );
}

app.listen(PORT, async () => {
  await connectDB(); // best-effort; server runs even if DB is down
  console.log(`Server started on port ${PORT}`);
});

// Don't let an unexpected async error take down the whole process.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
