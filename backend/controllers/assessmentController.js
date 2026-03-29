import Assessment from "../models/Assessment.js";
import Submission from "../models/Submission.js";
import Progress from "../models/Progress.js";
import UserProfile from "../models/UserProfile.js";
import { agentOrchestrator } from "../config/aiClient.js";

const toSafeProfile = (profileDoc) => {
  if (!profileDoc) {
    return {
      goal: "Become job-ready",
      role: "Learner",
      experience: "Beginner",
      stack: [],
      hoursPerWeek: 6,
    };
  }

  const raw = typeof profileDoc.toJSON === "function" ? profileDoc.toJSON() : profileDoc;
  return {
    goal: raw.goal || "Become job-ready",
    role: raw.role || "Learner",
    experience: raw.experience || "Beginner",
    stack: Array.isArray(raw.stack) ? raw.stack : [],
    hoursPerWeek: raw.hoursPerWeek || 6,
  };
};

const buildProgressSnapshot = (progress) => ({
  totalSolved: progress?.totalSolved || 0,
  dailyStreak: progress?.dailyStreak || 0,
  lastSolvedDate: progress?.lastSolvedDate || null,
});

const generateSubmissionCoaching = async (userId, payload, progress, submissionId = null) => {
  const profileDoc = await UserProfile.findOne({ userId });
  const profile = toSafeProfile(profileDoc);
  const coachingResult = await agentOrchestrator.generateSubmissionCoaching(profile, {
    ...payload,
    progress: buildProgressSnapshot(progress),
  });
  
  const coaching = coachingResult?.coaching;
  if (coaching && submissionId) {
    try {
      await Submission.findByIdAndUpdate(submissionId, { aiCoaching: coaching });
    } catch (e) { console.error("Error saving cached coaching:", e); }
  }
  return coaching;
};

const pushWeakArea = (target, area, severity, reason, source) => {
  if (!area || !reason) return;
  target.push({ area, severity, reason, source });
};

const analyzeCodingSubmission = (submission, weakAreas) => {
  const code = String(submission?.code || "");
  const problemTitle = String(submission?.problemTitle || "").toLowerCase();
  const language = String(submission?.language || "").toLowerCase();
  const nonEmptyLines = code.split("\n").map((line) => line.trim()).filter(Boolean);
  const lineCount = nonEmptyLines.length;
  const returnCount = (code.match(/\breturn\b/g) || []).length;
  const consoleCount = (code.match(/\b(console\.log|print)\b/g) || []).length;
  const hasTryCatch = /try\s*\{|catch\s*\(/m.test(code);
  const hasFunction = /\b(function\s+\w+|const\s+\w+\s*=\s*\(|def\s+\w+\s*\(|public\s+\w+\s+\w+\s*\()/m.test(code);
  const variableNames = [...code.matchAll(/\b(?:let|const|var)\s+([A-Za-z_][A-Za-z0-9_]*)/g)].map((m) => m[1]);
  const shortNameRatio = variableNames.length
    ? variableNames.filter((name) => name.length <= 2).length / variableNames.length
    : 0;

  if (lineCount < 8 || code.length < 120) {
    pushWeakArea(
      weakAreas,
      "Implementation depth",
      "Medium",
      `The latest code submission has only ${lineCount} non-empty lines, which can indicate missing edge-case handling or incomplete logic coverage.`,
      "current code submission"
    );
  }

  const nestedLoopPattern = /(for|while)\s*\([^)]*\)\s*\{[\s\S]{0,220}(for|while)\s*\(/m;
  if (nestedLoopPattern.test(code)) {
    pushWeakArea(
      weakAreas,
      "Time complexity awareness",
      "Medium",
      "Detected nested iterative patterns that may increase runtime cost for larger inputs.",
      "current code submission"
    );
  }

  if (/two\s*sum|pair\s*sum|target\s*sum/.test(problemTitle) && !/map\s*\(|new\s+Map|\{\s*\}|dict\(|unordered_map/i.test(code)) {
    pushWeakArea(
      weakAreas,
      "Data-structure choice",
      "High",
      "This problem typically benefits from a hash-map lookup, but the current code does not show that structure.",
      "current code submission"
    );
  }

  const hasGuard = /if\s*\(|return\s+.*(null|undefined|false|\[\]|\{\})/m.test(code);
  if (!hasGuard) {
    pushWeakArea(
      weakAreas,
      "Edge-case handling",
      "High",
      "No clear guard clauses detected for invalid, empty, or boundary inputs.",
      "current code submission"
    );
  }

  if (!hasFunction) {
    pushWeakArea(
      weakAreas,
      "Solution structure",
      "Medium",
      "No clear function/method boundary was detected, making the solution harder to test and reuse.",
      "current code submission"
    );
  }

  if (returnCount === 0 && language !== "sql") {
    pushWeakArea(
      weakAreas,
      "Output correctness",
      "High",
      "No return statement was detected, so the evaluator may not receive the expected output.",
      "current code submission"
    );
  }

  if (consoleCount > 2) {
    pushWeakArea(
      weakAreas,
      "Submission cleanliness",
      "Low",
      "Multiple debug print/log statements were detected; these can hide the core output during evaluation.",
      "current code submission"
    );
  }

  if (!hasTryCatch && /(parse|json|split|int|number|input)/i.test(code)) {
    pushWeakArea(
      weakAreas,
      "Runtime safety",
      "Low",
      "Potentially unsafe parsing/input operations were detected without explicit exception handling.",
      "current code submission"
    );
  }

  if (shortNameRatio > 0.6 && variableNames.length >= 3) {
    pushWeakArea(
      weakAreas,
      "Code readability",
      "Low",
      "Most variable names are very short (1-2 chars), which reduces readability during debugging or review.",
      "current code submission"
    );
  }
};

const analyzeQuizSubmission = (submission, weakAreas) => {
  const score = Number(submission?.score || 0);
  const totalQuestions = Number(submission?.totalQuestions || 0);
  const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;

  if (accuracy < 0.5) {
    pushWeakArea(
      weakAreas,
      "Conceptual fundamentals",
      "High",
      `Latest quiz accuracy is ${Math.round(accuracy * 100)}%, showing significant concept gaps in the assessed topic set.`,
      "current quiz submission"
    );
  } else if (accuracy < 0.75) {
    pushWeakArea(
      weakAreas,
      "Concept reinforcement",
      "Medium",
      `Latest quiz accuracy is ${Math.round(accuracy * 100)}%, indicating partial understanding that needs reinforcement.`,
      "current quiz submission"
    );
  }
};

const buildDynamicImprovementAreas = (latest, weakAreas) => {
  const actions = [];
  const seen = new Set();

  const add = (text) => {
    if (!text || seen.has(text)) return;
    seen.add(text);
    actions.push(text);
  };

  weakAreas.forEach((item) => {
    if (item.area === "Edge-case handling") {
      add("Before re-submitting, add explicit tests for empty input, single-item input, and max-boundary input.");
    } else if (item.area === "Time complexity awareness") {
      add("Refactor nested loops into hash-map or two-pointer style where possible to reduce worst-case runtime.");
    } else if (item.area === "Data-structure choice") {
      add("Introduce a lookup structure (for example, hash-map/dictionary) to convert repeated scans into near O(1) checks.");
    } else if (item.area === "Implementation depth") {
      add("Expand the solution into clear phases: input validation, core logic, and final output formatting.");
    } else if (item.area === "Conceptual fundamentals" || item.area === "Concept reinforcement") {
      add("Revisit incorrect quiz topics and solve 5 focused questions on the same concept before the next attempt.");
    } else if (item.area === "Retention consistency") {
      add("Use a 24-hour review cycle: revisit missed quiz concepts the next day with a short recap and mini-quiz.");
    } else if (item.area === "Code readability") {
      add("Rename key variables/functions to intent-based names and keep one responsibility per block.");
    } else if (item.area === "Runtime safety") {
      add("Wrap parsing and external input conversion with safe guards or fallback handling.");
    } else if (item.area === "Solution structure") {
      add("Wrap your logic inside a single well-named function and keep helper logic isolated for easier testing.");
    } else if (item.area === "Output correctness") {
      add("Ensure the function returns the exact value/type expected by the problem statement for all valid paths.");
    } else if (item.area === "Submission cleanliness") {
      add("Remove debug print/log statements before final submission and keep only deterministic output logic.");
    }
  });

  if (latest.submissionType === "coding") {
    add(`Re-submit \"${latest.problemTitle || "latest problem"}\" after applying the fixes above and compare acceptance speed.`);
  }

  if (latest.submissionType === "quiz") {
    const score = Number(latest.score || 0);
    const total = Number(latest.totalQuestions || 0);
    if (total > 0) {
      const target = Math.min(total, Math.max(score + 2, Math.ceil(total * 0.8)));
      add(`Retake the next quiz with a target score of at least ${target}/${total}.`);
    }
  }

  return actions.slice(0, 5);
};

const buildDynamicSummary = (latest, weakAreas) => {
  const createdAt = latest?.createdAt ? new Date(latest.createdAt) : new Date();
  const submittedAt = `${createdAt.toLocaleDateString()} at ${createdAt.toLocaleTimeString()}`;
  const title = latest.problemTitle || (latest.submissionType === 'coding' ? 'technical solution' : 'knowledge check');
  const primaryWeakness = (weakAreas?.[0]?.area || "core concepts").toLowerCase();

  if (latest.submissionType === "coding") {
    return `Analysis of your \"${title}\" implementation (${submittedAt}) identifies ${primaryWeakness} as your primary growth lever right now. Strengthening this will accelerate your roadmap to professional readiness.`;
  }

  const score = Number(latest.score || 0);
  const total = Number(latest.totalQuestions || 0);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  
  if (accuracy >= 80) {
    return `Excellent results on your \"${title}\" quiz (${submittedAt}) with ${accuracy}% accuracy. Maintaining this peak performance while addressing minor gaps in ${primaryWeakness} will solidify your elite standing.`;
  } else if (accuracy >= 50) {
    return `Solid effort on the \"${title}\" assessment (${submittedAt}). Your ${accuracy}% score indicates growing mastery, with ${primaryWeakness} being the key area to transition from foundational to advanced understanding.`;
  }
  return `Your recent \"${title}\" attempt (${submittedAt}) suggests you are still early in this topic. Focused revision on ${primaryWeakness} will quickly lift your current ${accuracy}% accuracy and build much-needed momentum.`;
};

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

// Submit Code
export const submitCode = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { code, language, problemTitle } = req.body;

    if (!code || !language || !problemTitle) {
      return res.status(400).json({ error: 'code, language, and problemTitle are required' });
    }

    await Submission.create({
      userId,
      submissionType: 'coding',
      code,
      language,
      problemTitle,
      status: 'accepted',
    });

    // Update progress
    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();
    if (!progress) {
      progress = await Progress.create({ userId, totalSolved: 1, dailyStreak: 1, lastSolvedDate: new Date() });
    } else {
      progress.totalSolved += 1;
      if (new Date(progress.lastSolvedDate).toDateString() !== today) {
        progress.dailyStreak += 1;
      }
      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    // Start background coaching generation (don't await to speed up response)
    const subId = submission._id;
    generateSubmissionCoaching(
      userId,
      {
        submissionType: "coding",
        language,
        problemTitle,
        codePreview: code.slice(0, 1200),
      },
      progress,
      subId
    ).catch(err => console.error("Background coaching error:", err));

    res.json({ 
      message: 'Code submission saved', 
      status: 'accepted', 
      coaching: null // Coaching will be visible in the AI Assistant dashboard
    });
  } catch (error) {
    console.error("submitCode error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Submit Quiz
export const submitQuiz = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { answers, score, totalQuestions } = req.body;

    if (score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'score and totalQuestions are required' });
    }

    await Submission.create({
      userId,
      submissionType: 'quiz',
      answers,
      score,
      totalQuestions,
      status: 'accepted',
    });

    // Update progress
    let progress = await Progress.findOne({ userId });
    const today = new Date().toDateString();
    if (!progress) {
      progress = await Progress.create({ userId, totalSolved: 1, dailyStreak: 1, lastSolvedDate: new Date() });
    } else {
      progress.totalSolved += 1;
      if (new Date(progress.lastSolvedDate).toDateString() !== today) {
        progress.dailyStreak += 1;
      }
      progress.lastSolvedDate = new Date();
      await progress.save();
    }

    // Background coaching
    const subId = submission._id;
    generateSubmissionCoaching(
      userId,
      {
        submissionType: "quiz",
        score,
        totalQuestions,
        answersCount: Array.isArray(answers) ? answers.length : 0,
      },
      progress,
      subId
    ).catch(err => console.error("Background coaching error:", err));

    res.json({ 
      message: 'Quiz submission saved', 
      score, 
      totalQuestions,
      coaching: null 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Submissions
export const getSubmissions = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Dashboard (aggregated progress data for charts)
export const getDashboard = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // Fetch all submissions for this user
    const submissions = await Submission.find({ userId }).sort({ createdAt: 1 });

    // Fetch progress summary
    const progress = await Progress.findOne({ userId });

    // --- Helper: format a date as "MMM D" (e.g. "Mar 27") ---
    const fmtDate = (d) => {
      const dt = new Date(d);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[dt.getMonth()]} ${dt.getDate()}`;
    };

    // --- 1. Main chart: daily score (cumulative solved count per day) ---
    const dailyScoreMap = {};
    let cumulativeScore = 0;
    for (const sub of submissions) {
      const key = fmtDate(sub.createdAt);
      cumulativeScore += (sub.score || 1);
      dailyScoreMap[key] = cumulativeScore;
    }
    const mainChartData = Object.entries(dailyScoreMap).map(([date, score]) => ({ date, score }));

    // --- 2. Daily coding questions solved ---
    const codingMap = {};
    for (const sub of submissions) {
      if (sub.submissionType === 'coding') {
        const key = fmtDate(sub.createdAt);
        codingMap[key] = (codingMap[key] || 0) + 1;
      }
    }
    const codingQuestionsData = Object.entries(codingMap).map(([day, solved]) => ({ day, solved }));

    // --- 3. Daily MCQ / quiz questions solved ---
    const mcqMap = {};
    for (const sub of submissions) {
      if (sub.submissionType === 'quiz' || sub.assessmentId) {
        const key = fmtDate(sub.createdAt);
        mcqMap[key] = (mcqMap[key] || 0) + 1;
      }
    }
    const mcqData = Object.entries(mcqMap).map(([day, solved]) => ({ day, solved }));

    // --- 4. Recent quiz scores ---
    const quizSubs = submissions.filter(s => s.submissionType === 'quiz' || s.assessmentId);
    const quizData = quizSubs.slice(-7).map((s, i) => ({
      name: `Quiz ${i + 1}`,
      score: s.score || 0,
    }));

    // --- 5. Summary stats ---
    const totalSolved = progress?.totalSolved || submissions.length;
    const dailyStreak = progress?.dailyStreak || 0;
    const totalCoding = submissions.filter(s => s.submissionType === 'coding').length;
    const totalQuiz = submissions.filter(s => s.submissionType === 'quiz' || s.assessmentId).length;

    res.json({
      mainChartData,
      codingQuestionsData,
      mcqData,
      quizData,
      stats: {
        totalSolved,
        dailyStreak,
        totalCoding,
        totalQuiz,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const profileData = req.body;

    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { ...profileData, userId },
      { new: true, upsert: true }
    );

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const profile = await UserProfile.findOne({ userId });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get AI Analysis
export const getAiAnalysis = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const latestCodeSubmissionDoc = await Submission.findOne({ userId, submissionType: "coding" }).sort({ createdAt: -1 });
    const latestSubmissionDoc = latestCodeSubmissionDoc || await Submission.findOne({ userId }).sort({ createdAt: -1 });
    const submissionCount = latestCodeSubmissionDoc
      ? await Submission.countDocuments({ userId, submissionType: "coding" })
      : await Submission.countDocuments({ userId });
    const progress = await Progress.findOne({ userId });
    const profile = await UserProfile.findOne({ userId });

    if (!latestSubmissionDoc) {
      return res.json({
        noSubmissions: true,
        message: "No analysis found. Complete the skill assessment to analyze your improvement areas."
      });
    }

    const safeProfile = toSafeProfile(profile);
    const latest = latestSubmissionDoc.toJSON();
    const weakAreas = [];

    if (latest.submissionType === "coding") {
      analyzeCodingSubmission(latest, weakAreas);
    }
    if (latest.submissionType === "quiz") {
      analyzeQuizSubmission(latest, weakAreas);
    }

    if (!weakAreas.length) {
      pushWeakArea(
        weakAreas,
        "Pattern transfer",
        "Low",
        "No major risk was detected from the latest submission, but focus on transferring solved patterns to new problems.",
        "latest submission"
      );
    }

    const focusedWeakAreas = [];
    const seenAreas = new Set();
    for (const item of weakAreas) {
      if (!item?.area || seenAreas.has(item.area)) continue;
      seenAreas.add(item.area);
      focusedWeakAreas.push(item);
      if (focusedWeakAreas.length >= 3) break;
    }

    const coachingPayload = latest.submissionType === "coding"
      ? {
        submissionType: "coding",
        language: latest.language,
        problemTitle: latest.problemTitle,
        codePreview: String(latest.code || "").slice(0, 1500),
      }
      : {
        submissionType: "quiz",
        score: latest.score,
        totalQuestions: latest.totalQuestions,
        answersCount: Array.isArray(latest.answers) ? latest.answers.length : 0,
      };

    // Check if we already have cached coaching for this latest submission
    let coaching = latestSubmissionDoc.aiCoaching;
    
    if (!coaching) {
      const coachingResult = await agentOrchestrator.generateSubmissionCoaching(safeProfile, {
        ...coachingPayload,
        progress: buildProgressSnapshot(progress),
      });
      coaching = coachingResult?.coaching || {};
      
      // Cache it for next time
      Submission.findByIdAndUpdate(latestSubmissionDoc._id, { aiCoaching: coaching }).catch(e => console.error("Cache update failed:", e));
    }
 
    const dynamicImprovementAreas = buildDynamicImprovementAreas(latest, focusedWeakAreas);
    const improvementAreas = dynamicImprovementAreas.length
      ? dynamicImprovementAreas
      : (Array.isArray(coaching.improvementSuggestions) && coaching.improvementSuggestions.length
        ? coaching.improvementSuggestions
        : [
          "Re-solve your latest problem with explicit edge-case checks.",
          "Practice 2 follow-up problems with similar patterns.",
          "Write a short reflection on mistakes before your next submission."
        ]);

    res.json({
      summary: coaching.summary || buildDynamicSummary(latest, focusedWeakAreas),
      currentSubmission: {
        submissionType: latest.submissionType || (latest.code ? "coding" : "quiz"),
        problemTitle: latest.problemTitle || "Quiz Attempt",
        language: latest.language || null,
        score: latest.score ?? null,
        totalQuestions: latest.totalQuestions ?? null,
        createdAt: latest.createdAt,
      },
      weakAreas: focusedWeakAreas,
      improvementAreas,
      analyzedSubmissionCount: submissionCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("getAiAnalysis technical error:", error);
    res.status(500).json({ error: error.message });
  }
};

// AI Chat
export const aiChat = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const profile = await UserProfile.findOne({ userId });
    const submissions = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(10);

    const result = await agentOrchestrator.handleChat(messages, profile || {}, submissions || []);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({ response: result.response });
  } catch (error) {
    console.error("aiChat error:", error);
    res.status(500).json({ error: error.message });
  }
};
