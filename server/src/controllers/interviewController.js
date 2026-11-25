import mongoose from "mongoose";
import InterviewSession from "../models/InterviewSession.js";
import {
  generateFirstQuestionAI,
  generateNextQuestionAI,
  evaluateInterviewAI,
} from "../services/geminiService.js";

/**
 * Create a new interview session and generate ONLY the opening question
 * POST /api/interview/generate
 */
export const createSession = async (req, res) => {
  try {
    const {
      role = "Junior Frontend Developer",
      experienceLevel = "Fresher (0-1 yr)",
      interviewType = "Technical Fundamentals",
      tags = [],
      questionCount = 3,
      timeLimitMinutes = 3,
    } = req.body || {};

    const normalizedTags = Array.isArray(tags) ? tags : [];
    const requestedCount = Math.min(Math.max(Number(questionCount) || 3, 1), 10);

    const firstQuestion = await generateFirstQuestionAI({
      role,
      experienceLevel,
      interviewType,
      tags: normalizedTags,
    });

    const session = await InterviewSession.create({
      user: req.user._id,
      role,
      experienceLevel,
      interviewType,
      tags: normalizedTags,
      questionCount: requestedCount,
      timeLimitMinutes: Number(timeLimitMinutes) || 3,
      questions: [firstQuestion],
      status: "in-progress",
    });

    res.status(201).json({
      message: "Interview session created",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      message: "Failed to generate opening interview question",
      error: error.message,
    });
  }
};

/**
 * Save the candidate's answer for the current question and generate the next adaptive question
 * POST /api/interview/:id/next
 */
export const submitAnswerAndNext = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const { questionId, answer = "", history = [] } = req.body || {};

    const session = await InterviewSession.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Interview session is already completed" });
    }

    if (session.questions.length === 0) {
      return res.status(400).json({ message: "Interview session has no questions" });
    }

    const currentQuestion = session.questions[session.questions.length - 1];
    const targetQuestionId = questionId !== undefined ? Number(questionId) : currentQuestion.id;

    // Idempotency guard against duplicate clicks/requests for an earlier question
    if (targetQuestionId < currentQuestion.id) {
      return res.status(200).json({
        message: "Next question already generated",
        session,
        nextQuestion: currentQuestion,
        isComplete: false,
      });
    }

    if (targetQuestionId !== currentQuestion.id) {
      return res.status(400).json({ message: "Question ID does not match active question" });
    }

    currentQuestion.candidateAnswer = typeof answer === "string" ? answer : String(answer || "");
    session.markModified("questions");

    const configuredCount = session.questionCount || 3;

    if (session.questions.length >= configuredCount) {
      await session.save();
      return res.status(200).json({
        message: "Final answer saved",
        session,
        nextQuestion: null,
        isComplete: true,
      });
    }

    // Build authoritative Q&A history (preferring DB questions, merging any missing answers from client history)
    const clientHistory = Array.isArray(history) ? history : [];
    const qaHistory = session.questions.map((q) => {
      const clientMatch = clientHistory.find((h) => Number(h.id) === Number(q.id));
      return {
        id: q.id,
        category: q.category,
        question: q.question,
        candidateAnswer: q.candidateAnswer || clientMatch?.answer || clientMatch?.candidateAnswer || "",
      };
    });

    const nextQuestion = await generateNextQuestionAI({
      role: session.role,
      experienceLevel: session.experienceLevel,
      interviewType: session.interviewType,
      tags: session.tags || [],
      questionNumber: session.questions.length + 1,
      totalQuestions: configuredCount,
      qaHistory,
    });

    session.questions.push(nextQuestion);
    await session.save();

    return res.status(200).json({
      message: "Next question generated",
      session,
      nextQuestion,
      isComplete: false,
    });
  } catch (error) {
    console.error("Generate next question error:", error);
    res.status(500).json({
      message: "Failed to generate the next interview question",
      error: error.message,
    });
  }
};

/**
 * Submit/confirm all answers and trigger AI evaluation
 * POST /api/interview/:id/evaluate
 */
export const evaluateSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const { answers = [], duration = "15 mins" } = req.body || {};
    const answerList = Array.isArray(answers) ? answers : [];

    const session = await InterviewSession.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const answerTexts = session.questions.map((q) => {
      const match = answerList.find((a) => Number(a.id) === Number(q.id));
      return match && match.answer !== undefined ? match.answer : (q.candidateAnswer || "");
    });

    const evaluation = await evaluateInterviewAI({
      role: session.role,
      experienceLevel: session.experienceLevel,
      questions: session.questions,
      answers: answerTexts,
    });

    // Update questions with final answers and per-question feedback
    session.questions = session.questions.map((q, idx) => {
      const matchFeedback = (evaluation.questionFeedback || []).find(
        (f) => Number(f.id) === Number(q.id)
      );

      return {
        ...q.toObject(),
        candidateAnswer: answerTexts[idx] || "",
        score: matchFeedback ? matchFeedback.score : 0,
        feedback: matchFeedback ? matchFeedback.feedback : "",
      };
    });

    session.overallScore = evaluation.overallScore;
    session.technicalScore = evaluation.technicalScore;
    session.clarityScore = evaluation.clarityScore;
    session.rating = evaluation.rating;
    session.badgeVariant = evaluation.badgeVariant;
    session.strengths = evaluation.strengths || [];
    session.improvements = evaluation.improvements || [];
    session.keyHighlights = evaluation.keyHighlights || "";
    session.suggestedFollowups = evaluation.suggestedFollowups || "";
    session.duration = duration;
    session.status = "completed";

    await session.save();

    res.status(200).json({
      message: "Interview evaluated successfully",
      session,
      evaluation,
    });
  } catch (error) {
    console.error("Evaluation error:", error);
    res.status(500).json({
      message: "Failed to evaluate interview answers",
      error: error.message,
    });
  }
};

/**
 * Get all interview sessions for the logged in user
 * GET /api/interview/history
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.status === "completed");

    const avgScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
              completedSessions.length
          )
        : 0;

    const strongHireCount = completedSessions.filter(
      (s) => s.rating === "Strong Hire"
    ).length;

    const strongHireRate =
      completedSessions.length > 0
        ? Math.round((strongHireCount / completedSessions.length) * 100)
        : 0;

    const hoursPracticed =
      Math.round(
        (completedSessions.reduce(
          (acc, s) =>
            acc +
            ((s.questions?.length || s.questionCount || 3) * (s.timeLimitMinutes || 3)),
          0
        ) /
          60) *
          10
      ) / 10;

    res.status(200).json({
      sessions,
      stats: {
        totalSessions,
        completedCount: completedSessions.length,
        avgScore,
        strongHireRate,
        hoursPracticed,
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};

/**
 * Get single interview session by ID
 * GET /api/interview/:id
 */
export const getSessionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch session",
      error: error.message,
    });
  }
};
