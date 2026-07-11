const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Gemini client wrapper.
 *
 * Reads the API key from GEMINI_API_KEY (preferred) or AIKey (legacy name used
 * in the existing .env). The model can be overridden with GEMINI_MODEL.
 */
const API_KEY = process.env.GEMINI_API_KEY || process.env.AIKey;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-flash-latest";

if (!API_KEY) {
  // Don't crash the whole process here – index.js validates env and prints a
  // friendly message. We just make the failure obvious if a route is hit.
  console.warn(
    "[gemini] No GEMINI_API_KEY / AIKey found in environment. Gemini calls will fail."
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Convert an OpenAI-style history ([{ role: "user"|"assistant"|"model", content }])
 * into the "contents" format Gemini expects.
 */
function toGeminiContents(history = []) {
  return history
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

/**
 * Strip markdown code fences / stray prose so a JSON string can be parsed.
 */
function extractJson(text = "") {
  if (!text) return text;
  // Remove ```json ... ``` or ``` ... ``` fences.
  let cleaned = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  // Grab the outermost {...} or [...] block if there is surrounding prose.
  const firstBrace = cleaned.search(/[[{]/);
  const lastBrace = Math.max(cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]"));
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

/**
 * Low-level call. Returns the raw text produced by the model.
 *
 * @param {Array}  history            Conversation so far (OpenAI-style roles).
 * @param {Object} opts
 * @param {string} opts.systemInstruction  Persona / rules for the model.
 * @param {boolean} opts.json               Ask Gemini for JSON output.
 * @param {number}  opts.temperature
 */
async function generate(history, opts = {}) {
  if (!genAI) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY (or AIKey) in the environment."
    );
  }

  const { systemInstruction, json = false, temperature = 0.8 } = opts;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  });

  const result = await model.generateContent({
    contents: toGeminiContents(history),
  });

  const text = result?.response?.text?.() ?? "";
  if (!text || !text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }
  return text.trim();
}

/**
 * Convenience: get a plain text reply.
 */
async function generateText(history, opts = {}) {
  return generate(history, { ...opts, json: false });
}

/**
 * Convenience: get a parsed JSON object. Throws if the model output can't be
 * parsed even after cleanup.
 */
async function generateJson(history, opts = {}) {
  const raw = await generate(history, { ...opts, json: true });
  try {
    return JSON.parse(extractJson(raw));
  } catch (err) {
    const cleaned = extractJson(raw);
    try {
      return JSON.parse(cleaned);
    } catch (_) {
      throw new Error(
        `Failed to parse JSON from Gemini response: ${cleaned.slice(0, 200)}`
      );
    }
  }
}

module.exports = {
  genAI,
  MODEL_NAME,
  isConfigured: () => Boolean(genAI),
  generate,
  generateText,
  generateJson,
  toGeminiContents,
  extractJson,
};
