import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import Progress from "../models/Progress.js";

// Get Assessment
export const getAssessment = async (req, res) => {
  try {
    const { skill, type } = req.query;

    const assessment = await Assessment.findOne({ skill, type });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit Assessment
export const submitAssessment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);

    let score = 0;

    assessment.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    const aiFeedback =
      score > assessment.questions.length / 2
        ? "Great performance! You're improving fast."
        : "Needs improvement. Focus more on fundamentals.";

    await Submission.create({
      userId,
      assessmentId,
      answers,
      score,
      aiFeedback
    });

    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();

    if (!progress) {
      progress = await Progress.create({
        userId,
        totalSolved: 1,
        dailyStreak: 1,
        lastSolvedDate: new Date()
      });
    } else {
      progress.totalSolved += 1;

      if (
        new Date(progress.lastSolvedDate).toDateString() !== today
      ) {
        progress.dailyStreak += 1;
      }

      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    res.json({
      message: "Submission successful",
      score,
      aiFeedback
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Progress
export const getProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const progress = await Progress.findOne({ userId });

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
