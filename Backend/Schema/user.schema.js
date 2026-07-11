const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    interviewNumber: Number,
    TechnicalKnowledge: Number,
    ProblemSolving: Number,
    CriticalThinking: Number,
    CommunicationSkills: Number,
    UoF: Number,
    average: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      unique: true,
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned by default queries
    },
    name: {
      type: String,
      trim: true,
    },
    // Set per-interview, not at registration.
    course: {
      type: String,
    },
    data: [resultSchema],
  },
  { timestamps: true }
);

module.exports = { userSchema };
