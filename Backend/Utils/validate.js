/**
 * Small validation / input-extraction helpers.
 * Kept dependency-free to avoid pulling in a validation library.
 */

// Courses the interviewer knows about, with the topic list used to seed the LLM.
const COURSE_TOPICS = {
  Node: [
    "Node.js runtime & event loop",
    "Asynchronous programming (callbacks, promises, async/await)",
    "Express.js, middleware & routing",
    "HTTP, REST APIs & status codes",
    "Modules, CommonJS vs ESM & npm / package.json",
    "Streams, buffers & the file system",
    "Error handling & debugging",
  ],
  React: [
    "JSX & components (functional vs class)",
    "State, props & the Virtual DOM",
    "Hooks (useState, useEffect, useMemo, useCallback, custom hooks)",
    "Rendering, reconciliation & performance",
    "React Router",
    "Context API & Redux / state management",
    "Component lifecycle & side effects",
  ],
  Java: [
    "OOP principles (encapsulation, inheritance, polymorphism, abstraction)",
    "Data types, collections & generics",
    "Exception handling",
    "Multithreading & concurrency",
    "JVM, memory model & garbage collection",
    "Interfaces, abstract classes & the keyword set",
    "Streams & functional interfaces",
  ],
  Angular: [
    "Components, templates & data binding",
    "Directives & pipes",
    "Services & dependency injection",
    "RxJS & observables",
    "Routing & guards",
    "Modules & lazy loading",
    "Forms (template-driven & reactive)",
  ],
};

const ALLOWED_COURSES = Object.keys(COURSE_TOPICS);

/**
 * Pull the user's answer / prompt text out of a request no matter how the client
 * sent it: JSON `{ prompt }`, `{ text }`, `{ answer }`, a raw string body, or a
 * urlencoded body (axios sends string data as `application/x-www-form-urlencoded`,
 * which express parses to `{ "<the text>": "" }`).
 */
function extractPrompt(req) {
  const b = req.body;
  if (typeof b === "string") return b.trim();
  if (b && typeof b === "object") {
    for (const key of ["prompt", "text", "answer", "message", "content"]) {
      if (typeof b[key] === "string" && b[key].trim()) return b[key].trim();
    }
    // urlencoded single-key case: { "my answer": "" }
    const keys = Object.keys(b);
    if (keys.length === 1 && (b[keys[0]] === "" || b[keys[0]] == null)) {
      return String(keys[0]).trim();
    }
  }
  return "";
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Normalise a course value (case-insensitive) to a known course or null. */
function normaliseCourse(value) {
  if (!value || typeof value !== "string") return null;
  const match = ALLOWED_COURSES.find(
    (c) => c.toLowerCase() === value.trim().toLowerCase()
  );
  return match || null;
}

module.exports = {
  COURSE_TOPICS,
  ALLOWED_COURSES,
  extractPrompt,
  isValidEmail,
  normaliseCourse,
};
