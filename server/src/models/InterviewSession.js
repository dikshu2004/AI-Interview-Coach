import mongoose from "mongoose";

const questionItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: { type: String, default: "General" },
    question: { type: String, required: true },
    hint: { type: String, default: "" },
    candidateAnswer: { type: String, default: "" },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "Software Engineer",
    },
    experienceLevel: {
      type: String,
      default: "Mid-Level",
    },
    interviewType: {
      type: String,
      default: "Technical Deep Dive",
    },
    tags: [
      {
        type: String,
      },
    ],
    questionCount: {
      type: Number,
      default: 3,
    },
    timeLimitMinutes: {
      type: Number,
      default: 3,
    },
    questions: [questionItemSchema],
    overallScore: {
      type: Number,
      default: 0,
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    clarityScore: {
      type: Number,
      default: 0,
    },
    rating: {
      type: String,
      default: "In Progress",
    },
    badgeVariant: {
      type: String,
      default: "cyan",
    },
    strengths: [
      {
        type: String,
      },
    ],
    improvements: [
      {
        type: String,
      },
    ],
    keyHighlights: {
      type: String,
      default: "",
    },
    suggestedFollowups: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["in-progress", "completed", "cancelled"],
      default: "in-progress",
    },
    duration: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);

export default InterviewSession;
