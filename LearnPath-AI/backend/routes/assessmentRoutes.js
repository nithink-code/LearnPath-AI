import express from "express";
import { requireAuth } from "../middleware/clerkMiddleware.js";
import {
  getAssessment,
  submitAssessment,
  getProgress
} from "../controllers/assessmentController.js";

const router = express.Router();

router.get("/get", requireAuth, getAssessment);
router.post("/submit", requireAuth, submitAssessment);
router.get("/progress", requireAuth, getProgress);

export default router;
