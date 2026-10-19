import express from "express";
import authMiddleware from "../middleware/authmiddleware.js";
import {
  createSession,
  evaluateSession,
  getInterviewHistory,
  getSessionById,
} from "../controllers/interviewController.js";

const router = express.Router();

// All interview routes require authentication
router.post("/generate", authMiddleware, createSession);
router.post("/:id/evaluate", authMiddleware, evaluateSession);
router.get("/history", authMiddleware, getInterviewHistory);
router.get("/:id", authMiddleware, getSessionById);

export default router;
