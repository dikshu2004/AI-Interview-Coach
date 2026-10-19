import InterviewSession from "../models/InterviewSession.js";
import {
  generateQuestionsAI,
  evaluateInterviewAI,
} from "../services/geminiService.js";

/**
 * Create a new interview session and generate AI questions
 * POST /api/interview/generate
 */
export const createSession = async (req, res) => {
  try {
    const {
      role = "Frontend Engineer",
      experienceLevel = "Senior (5-8 yrs)",
      interviewType = "Technical Deep Dive",
      tags = [],
      questionCount = 3,
      timeLimitMinutes = 3,
    } = req.body;

    const questions = await generateQuestionsAI({
      role,
      experienceLevel,
      interviewType,
      tags,
      questionCount: Number(questionCount) || 3,
    });

    const session = await InterviewSession.create({
      user: req.user._id,
      role,
      experienceLevel,
      interviewType,
      tags,
      questionCount: questions.length,
      timeLimitMinutes: Number(timeLimitMinutes) || 3,
      questions,
      status: "in-progress",
    });

    res.status(201).json({
      message: "Interview session created",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
};

/**
 * Submit answers and trigger AI evaluation
 * POST /api/interview/:id/evaluate
 */
export const evaluateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers = [], duration = "15 mins" } = req.body;

    const session = await InterviewSession.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    const answerTexts = session.questions.map((q) => {
      const match = answers.find((a) => a.id === q.id);
      return match ? match.answer : "";
    });

    const evaluation = await evaluateInterviewAI({
      role: session.role,
      experienceLevel: session.experienceLevel,
      questions: session.questions,
      answers: answerTexts,
    });

    // Update questions with answers and feedback
    session.questions = session.questions.map((q) => {
      const matchAnswer = answers.find((a) => a.id === q.id);
      const matchFeedback = (evaluation.questionFeedback || []).find(
        (f) => f.id === q.id
      );

      return {
        ...q.toObject(),
        candidateAnswer: matchAnswer ? matchAnswer.answer : "",
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

    const hoursPracticed = Math.round(
      (completedSessions.reduce(
        (acc, s) => acc + (s.questionCount || 3) * (s.timeLimitMinutes || 3),
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
        hoursPracticed: hoursPracticed || 1.2,
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
