const express = require("express");
const userRoute = express.Router();

const gemini = require("../Config/gemini");
const { getSession, resetSession } = require("../Utils/sessions");
const {
  COURSE_TOPICS,
  ALLOWED_COURSES,
  extractPrompt,
  normaliseCourse,
} = require("../Utils/validate");
const { UserModel } = require("../Models/user.model");
const { dbReady } = require("../Config/db");
const { protect } = require("../Middleware/auth");

/**
 * Wrap an async route handler so thrown errors go to the error middleware
 * instead of crashing the process / hanging the request.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/** System persona shared by the interview endpoints. */
function interviewerSystemPrompt(course) {
  return `You are "Aria", a friendly but rigorous senior technical interviewer conducting a spoken mock interview for a ${course} developer role.

Rules you MUST follow:
- Ask exactly ONE question at a time. Never number your questions or ask multiple things at once.
- Keep questions concise and conversational (1-3 sentences), as if speaking aloud.
- Start easy and progressively increase difficulty based on the candidate's answers (adaptive interviewing).
- Do NOT reveal the answer unless explicitly asked for feedback.
- Never repeat a question you have already asked.
- Stay strictly on ${course} and closely related computer-science fundamentals.
- Do not include markdown, code fences, or role labels in your questions — just the plain question text.`;
}

/* -------------------------------------------------------------------------- */
/*  General smart Q&A endpoint (POST /chat/test)                              */
/*  Answers arbitrary questions clearly — useful for a general assistant.     */
/* -------------------------------------------------------------------------- */
userRoute.post(
  "/test",
  asyncHandler(async (req, res) => {
    const prompt = extractPrompt(req);
    if (!prompt) {
      return res
        .status(400)
        .json({ msg: "A non-empty 'prompt' is required." });
    }

    const session = getSession(req);
    session.history.push({ role: "user", content: prompt });

    const reply = await gemini.generateText(session.history, {
      systemInstruction:
        "You are a concise, knowledgeable assistant. Answer clearly and accurately. Use plain text unless code is explicitly requested.",
      temperature: 0.7,
    });

    session.history.push({ role: "model", content: reply });
    res.json({ reply });
  })
);

/* -------------------------------------------------------------------------- */
/*  Start an interview (POST /chat/start?sub=React)                           */
/*  Returns the first question as a plain string (frontend renders it raw).   */
/* -------------------------------------------------------------------------- */
userRoute.post(
  "/start",
  protect,
  asyncHandler(async (req, res) => {
    const course = normaliseCourse(req.query.sub || (req.body && req.body.course));
    if (!course) {
      return res.status(400).json({
        msg: `Invalid or missing course. Choose one of: ${ALLOWED_COURSES.join(", ")}.`,
      });
    }

    const session = resetSession(req);
    session.course = course;
    // Identity comes from the verified token, not the request body.
    session.email = req.user.email;

    const topics = COURSE_TOPICS[course].join("\n- ");
    session.history.push({
      role: "user",
      content: `Begin the interview. Ask me your first question. Pick from these ${course} topics:\n- ${topics}`,
    });

    const question = await gemini.generateText(session.history, {
      systemInstruction: interviewerSystemPrompt(course),
    });

    session.history.push({ role: "model", content: question });
    session.questions.push(question);

    res.send(question);
  })
);

/* -------------------------------------------------------------------------- */
/*  Submit an answer (POST /chat/submit?feedback=0|1)                         */
/*  feedback=1 -> give instant feedback; feedback=0 -> just move on.          */
/*  Returns the AI's reply (feedback + next question) as a plain string.      */
/* -------------------------------------------------------------------------- */
userRoute.post(
  "/submit",
  protect,
  asyncHandler(async (req, res) => {
    const answer = extractPrompt(req);
    if (!answer) {
      return res
        .status(400)
        .json({ msg: "Please provide your answer text." });
    }

    const session = getSession(req);
    if (!session.course || session.history.length === 0) {
      return res
        .status(409)
        .json({ msg: "No active interview. Call /chat/start first." });
    }

    const wantsFeedback = String(req.query.feedback) === "1";
    const instruction = wantsFeedback
      ? "Briefly (1-2 sentences) give constructive feedback on my answer above, then ask the next question."
      : "Note my answer silently (no feedback) and simply ask the next question.";

    session.history.push({
      role: "user",
      content: `My answer: "${answer}".\n${instruction} Do not repeat any question you already asked: ${JSON.stringify(
        session.questions
      )}`,
    });

    const reply = await gemini.generateText(session.history, {
      systemInstruction: interviewerSystemPrompt(session.course),
    });

    session.history.push({ role: "model", content: reply });
    session.questions.push(reply);

    res.send(reply);
  })
);

/* -------------------------------------------------------------------------- */
/*  Skip to the next question (POST /chat/next)                               */
/* -------------------------------------------------------------------------- */
userRoute.post(
  "/next",
  protect,
  asyncHandler(async (req, res) => {
    const session = getSession(req);
    if (!session.course || session.history.length === 0) {
      return res
        .status(409)
        .json({ msg: "No active interview. Call /chat/start first." });
    }

    session.history.push({
      role: "user",
      content: `Ask the next question. Do not repeat any of these already-asked questions: ${JSON.stringify(
        session.questions
      )}`,
    });

    const question = await gemini.generateText(session.history, {
      systemInstruction: interviewerSystemPrompt(session.course),
    });

    session.history.push({ role: "model", content: question });
    session.questions.push(question);

    res.send(question);
  })
);

/* -------------------------------------------------------------------------- */
/*  End the interview and score it (POST /chat/logout)                        */
/*  Returns a JSON object with the five rubric scores + average.             */
/* -------------------------------------------------------------------------- */
const clampScore = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
};

userRoute.post(
  "/logout",
  protect,
  asyncHandler(async (req, res) => {
    const session = getSession(req);
    if (!session.course || session.history.length === 0) {
      return res
        .status(409)
        .json({ msg: "No active interview to evaluate." });
    }

    session.history.push({
      role: "user",
      content: `The interview is over. Evaluate my overall performance across the whole conversation using these rubrics, each scored 0-10:
- "Technical Knowledge": understanding of core ${session.course} concepts.
- "Problem-Solving Skills": logical, structured approach to problems.
- "Critical Thinking": weighing options and choosing sound solutions.
- "Communication Skills": clarity and articulation of answers.
- "Understanding of Fundamentals": grasp of foundational principles.

Respond ONLY with a JSON object using exactly these keys and numeric values:
{"Technical Knowledge": <number>, "Problem-Solving Skills": <number>, "Critical Thinking": <number>, "Communication Skills": <number>, "Understanding of Fundamentals": <number>}`,
    });

    const data = await gemini.generateJson(session.history, {
      systemInstruction: interviewerSystemPrompt(session.course),
      temperature: 0.3,
    });

    const result = {
      TechnicalKnowledge: clampScore(data["Technical Knowledge"]),
      ProblemSolving: clampScore(data["Problem-Solving Skills"]),
      CriticalThinking: clampScore(data["Critical Thinking"]),
      CommunicationSkills: clampScore(data["Communication Skills"]),
      UoF: clampScore(data["Understanding of Fundamentals"]),
    };
    const scores = Object.values(result);
    result.average =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

    // Persist if we have an email and a live DB connection (best-effort).
    if (session.email && dbReady()) {
      try {
        await UserModel.findOneAndUpdate(
          { email: session.email },
          {
            $setOnInsert: { email: session.email, course: session.course },
            $push: { data: { ...result, createdAt: new Date() } },
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn(`[logout] Failed to persist result: ${err.message}`);
      }
    }

    res.json(result);
  })
);

module.exports = { userRoute };
