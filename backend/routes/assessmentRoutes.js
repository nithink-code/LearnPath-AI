import express from "express";
import { requireAuth } from "../middleware/clerkMiddleware.js";
import {
  getAssessment,
  submitAssessment,
  getProgress,
  submitCode,
  submitQuiz,
  getSubmissions
} from "../controllers/assessmentController.js";

const router = express.Router();

router.get("/get", requireAuth, getAssessment);
router.post("/submit", requireAuth, submitAssessment);
router.get("/progress", requireAuth, getProgress);
router.post("/submit-code", requireAuth, submitCode);
router.post("/submit-quiz", requireAuth, submitQuiz);
router.get("/submissions", requireAuth, getSubmissions);

export default router;
