export class AgentOrchestrator {
    constructor(client) {
        this.client = client;
        this.studyMaterials = [];
        this.recentActivity = [];
        this.model = process.env.OPENROUTER_PRIMARY_MODEL || "google/gemini-2.0-flash-lite-preview-02-05:free";
        this.fallbackModels = (process.env.OPENROUTER_FALLBACK_MODELS || "meta-llama/llama-3.2-3b-instruct:free,qwen/qwen-2.5-72b-instruct:free,google/gemma-2-9b-it:free,openrouter/free")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        this.openRouterOptions = {
            headers: {
                "HTTP-Referer": "https://learnpath-ai.xyz",
                "X-Title": "LearnPath-AI",
            }
        };
    }

    buildModelAttempts(extraModels = []) {
        return [...new Set([this.model, ...this.fallbackModels, ...extraModels].filter(Boolean))];
    }

    isEndpointMissingError(error) {
        const msg = String(error?.message || "").toLowerCase();
        return msg.includes("no endpoints found") || msg.includes("404") || msg.includes("not found");
    }

    async requestCompletion(messages, purpose = "request", extraModels = []) {
        const attempts = this.buildModelAttempts(extraModels);
        let completion;
        let lastError;

        for (const modelId of attempts) {
            try {
                this.logActivity(`Attempting ${purpose} with: ${modelId}`);
                completion = await this.client.chat.completions.create({
                    model: modelId,
                    messages,
                    temperature: 0.3,
                }, this.openRouterOptions);

                if (completion?.choices?.[0]?.message?.content) {
                    return completion;
                }
            } catch (err) {
                lastError = err;
                this.logActivity(`${modelId} failed: ${err.message}`);
                if (this.isEndpointMissingError(err)) {
                    continue;
                }
            }
        }

        throw lastError || new Error(`All ${purpose} models exhausted`);
    }

    isOutOfScopeChat(userPrompt = "") {
        const text = String(userPrompt || "").toLowerCase();
        if (!text.trim()) return false;

        const allowedHints = [
            "code", "coding", "program", "algorithm", "debug", "bug", "error", "react", "node", "javascript", "python", "java",
            "database", "sql", "mongodb", "api", "backend", "frontend", "interview", "dsa", "system design", "skill", "tech",
            "learning", "roadmap", "project", "career", "assessment", "quiz", "submission", "improve", "optimization"
        ];

        const blockedHints = [
            "politics", "election", "president", "celebrity", "movie", "cinema", "song", "music", "football", "cricket", "bet", "gambling",
            "astrology", "horoscope", "religion debate", "stock tip", "crypto prediction", "dating", "relationship", "gossip", "joke",
            "medical diagnosis", "legal advice", "hack", "exploit", "malware", "adult"
        ];

        const hasAllowed = allowedHints.some((hint) => text.includes(hint));
        const hasBlocked = blockedHints.some((hint) => text.includes(hint));
        const greetingOnly = /^(hi|hello|hey|yo|hola|good\s*(morning|afternoon|evening))\b/.test(text.trim());
        const likelyQuestion = text.includes("?") || /\b(what|why|how|when|where|who|which|can|should|could|would|tell me|explain)\b/.test(text);

        if (greetingOnly) return false;
        if (hasBlocked && !hasAllowed) return true;
        if (!hasAllowed && likelyQuestion) return true;
        return false;
    }

    parseJsonFromModel(raw) {
        if (!raw || typeof raw !== "string") {
            throw new Error("Invalid AI response format");
        }

        try {
            return JSON.parse(raw);
        } catch (e) {
            const match = raw.match(/```json([\s\S]*?)```/);
            if (match?.[1]) {
                return JSON.parse(match[1].trim());
            }
            const firstBrace = raw.indexOf("{");
            const lastBrace = raw.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
            }
            throw e;
        }
    }

    buildFallbackAnalysis(profile, submissions, progress) {
        const totalSolved = progress?.totalSolved || submissions?.length || 0;
        const streak = progress?.dailyStreak || 0;
        const goal = profile?.goal || "your target role";

        return {
            level: "Emerging Engineer",
            executiveSummary: `You are building momentum toward ${goal}. Maintain consistency and deepen practical problem-solving to accelerate readiness.`,
            skillGaps: [
                { area: "Problem decomposition", gap: "Break larger problems into reusable patterns more consistently.", severity: "High" },
                { area: "Code quality", gap: "Improve naming, edge-case handling, and test thinking.", severity: "Medium" },
                { area: "System understanding", gap: "Connect coding exercises to architecture-level decisions.", severity: "Medium" }
            ],
            improvementStrategies: [
                { title: "Deliberate practice blocks", description: "Run 3 focused sessions weekly: one concept review, one timed solve, one refactor session.", effort: "4-5 hrs/week" },
                { title: "Error journal", description: "Track failed attempts by mistake type and revisit weak patterns weekly.", effort: "30 min/week" },
                { title: "Production-style reviews", description: "After each accepted submission, improve readability and complexity with a second pass.", effort: "15 min/submission" }
            ],
            roadmap: [
                { step: 1, task: "Stabilize foundations", details: "Master language fundamentals and common data structures." },
                { step: 2, task: "Scale problem solving", details: "Solve mixed-difficulty challenges with time-boxed attempts." },
                { step: 3, task: "Apply to projects", details: "Implement end-to-end features and explain design trade-offs." },
                { step: 4, task: "Interview readiness", details: "Practice communication, system design basics, and mock rounds." }
            ],
            bestPractices: [
                "Clarify constraints before coding.",
                "Write for readability first, then optimize.",
                "Validate edge cases with minimal test inputs.",
                "Reflect on every failed attempt."
            ],
            stats: {
                xp: Math.max(500, totalSolved * 120),
                nextLevelXp: Math.max(1500, totalSolved * 120 + 1000),
                percentile: streak >= 7 ? "Top 20%" : "Top 35%"
            },
            badges: ["Consistent Learner", "Problem Solver"]
        };
    }

    buildFallbackSubmissionCoaching(profile, payload) {
        const goal = profile?.goal || "your target role";
        const isQuiz = payload?.submissionType === "quiz";
        const score = Number(payload?.score || 0);
        const total = Number(payload?.totalQuestions || 0);
        const ratio = total > 0 ? score / total : null;

        let summary = `Solid progress toward ${goal}. Keep your practice consistent and reflective.`;
        if (isQuiz && ratio !== null) {
            if (ratio >= 0.8) {
                summary = `Great quiz performance. You are showing strong conceptual readiness for ${goal}.`;
            } else if (ratio >= 0.5) {
                summary = `Good attempt. You are improving, and targeted revision will quickly raise your quiz accuracy.`;
            } else {
                summary = `You are still early in this topic. A focused basics-first revision plan will help you improve fast.`;
            }
        }

        return {
            summary,
            improvementSuggestions: [
                "Review one weak topic immediately after each submission and solve 2 follow-up problems.",
                "Time-box attempts and write a short reflection on what slowed you down.",
                "Convert repeated mistakes into a personal checklist before the next attempt."
            ],
            bestPractices: [
                "Confirm assumptions and edge cases before finalizing answers.",
                "Prioritize clean, readable solutions with clear variable naming.",
                "After acceptance, optimize complexity only if readability is preserved."
            ],
            guidedPath: [
                { step: 1, title: "Diagnose", action: "Identify one concept or pattern you missed in this submission." },
                { step: 2, title: "Drill", action: "Practice 2-3 related questions of increasing difficulty." },
                { step: 3, title: "Refine", action: "Re-solve this problem with improved structure and edge-case checks." },
                { step: 4, title: "Apply", action: `Use the same pattern in a mini feature aligned with ${goal}.` }
            ]
        };
    }

    async handleChat(messages, profile, submissions) {
        this.logActivity(`Chat request received...`);

        const latestUserMessage = [...(messages || [])].reverse().find((msg) => msg?.role === "user")?.content || "";
        if (this.isOutOfScopeChat(latestUserMessage)) {
            return {
                success: true,
                response: "I can help with skills and technology only. Ask me about coding problems, your stack, interview prep, projects, or how to improve your latest submission."
            };
        }

        const codingSubmissions = (submissions || []).filter(s => s.submissionType === 'coding');
        const quizSubmissions = (submissions || []).filter(s => s.submissionType === 'quiz');
        const latestSubmission = (submissions || [])[0] || null;

        const chatPreferredModels = (process.env.OPENROUTER_CHAT_MODELS || "google/gemini-2.0-flash-lite-preview-02-05:free,meta-llama/llama-3.3-70b-instruct:free,openai/gpt-oss-120b:free,openrouter/free")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        const contextPrompt = `
You are Lumina, a premium personal AI Mentor. 
Stay strictly within software engineering, skill development, and technology learning topics.
If the user asks something outside these topics, politely refuse and redirect to a relevant tech-skill question.
Keep responses concise, practical, and under 120 words when possible.
User Context:
- Role: ${profile.role}
- Experience: ${profile.experience}
- Tech Stack: ${(profile.stack || []).join(", ")}
- Goal: ${profile.goal}
- Submissions: ${codingSubmissions.length} coding, ${quizSubmissions.length} quiz.
- Latest Submission: ${latestSubmission?.problemTitle || "N/A"} (${latestSubmission?.submissionType || "N/A"})

Provide helpful, personalized advice based on this context. 
IMPORTANT FORMATTING:
- Do NOT use markdown bolding (double asterisks **). 
- Use a clear, point-wise numbered list or bullet points for structured information. 
- Keep the tone professional, minimalist, and developer-centric.
- Be concise but deep.
`;

        try {
            const completion = await this.requestCompletion([
                { role: "system", content: contextPrompt },
                ...messages
            ], "chat", chatPreferredModels);

            return { success: true, response: completion.choices[0].message.content };
        } catch (error) {
            console.error("AgentOrchestrator Chat Error:", error);
            return {
                success: true,
                response: "I'm having a bit of trouble reaching my top-tier neural cores right now, but I can still answer basic questions. Please try again in a moment for a deeper analysis, or ask me something technical!"
            };
        }
    }

    async generateAnalysis(profile, submissions, progress) {
        this.logActivity(`Generating personalized analysis for user...`);

        const codingSubmissions = (submissions || []).filter(s => s.submissionType === 'coding');
        const quizSubmissions = (submissions || []).filter(s => s.submissionType === 'quiz');

        const systemPrompt = `
You are Lumina, a world-class AI Career Strategist and Senior Engineering Mentor. 
Your goal is to provide a highly professional, deep-dive analysis of a student's technical standing, identifying precise skill gaps and outlining a strategic roadmap to their ultimate career goal.

User Profile:
- Target Role/Goal: ${profile.goal}
- Current Role: ${profile.role}
- Experience: ${profile.experience}
- Tech Stack: ${(profile.stack || []).join(", ")}
- Hours/Week available: ${profile.hoursPerWeek}

Real Performance Data:
- Daily Streak: ${progress?.dailyStreak || 0}
- Total Solved: ${progress?.totalSolved || 0}
- Coding Submissions: ${codingSubmissions.length}
- Quiz Submissions: ${quizSubmissions.length}
- Recent Topics: ${codingSubmissions.slice(0, 5).map(s => s.problemTitle).join(", ")}
- Recent Scores: ${quizSubmissions.slice(0, 5).map(s => `${s.score}/${s.totalQuestions}`).join(", ")}

Task:
Analyze their performance relative to their Goal (${profile.goal}). Provide:
1. "Skill Gap Analysis": Identify 3 precise technical areas missing or weak for their target goal. For each, provide a 'severity' (High, Medium, Low).
2. "Strategic Improvement Plan": Provide 3-4 specific strategies (not just steps, but 'how' to study) to bridge these gaps.
3. "Roadmap to ${profile.goal}": A 4-step sequential plan to reach their target role. 
4. "Elite Standards": Architectural or professional practices they should adopt.
5. "Professional Summary": A concise executive summary of their current standing.

Ensure the response is valid JSON:
{
  "level": "The user's professional title (e.g., 'Junior AI Engineer')",
  "executiveSummary": "Concise summary of their status...",
  "skillGaps": [
    { "area": "Topic", "gap": "Description of what's missing", "severity": "High/Medium/Low" }
  ],
  "improvementStrategies": [
    { "title": "Strategy Name", "description": "How to implement it", "effort": "Estimated effort" }
  ],
  "roadmap": [
    { "step": 1, "task": "Title", "details": "Actionable detail" }
  ],
  "bestPractices": ["Practice 1", "Practice 2"],
  "stats": {
    "xp": 1500,
    "nextLevelXp": 2500,
    "percentile": "Top 15%"
  },
  "badges": ["Problem Solver", "Consistent"]
}
`;

        try {
            const completion = await this.requestCompletion([
                { role: "system", content: "You are a personalized AI mentor. Return only JSON." },
                { role: "user", content: systemPrompt }
            ], "analysis");

            const raw = completion.choices[0].message.content;
            const parsed = this.parseJsonFromModel(raw);
            return { success: true, analysis: parsed };
        } catch (error) {
            console.error("AgentOrchestrator Analysis Error:", error);
            return {
                success: true,
                analysis: this.buildFallbackAnalysis(profile, submissions, progress),
                fallback: true,
                details: error.message
            };
        }
    }

    async generateSubmissionCoaching(profile = {}, payload = {}) {
        const prompt = `
You are Lumina, an expert personal mentor helping a learner improve after a submission.

Learner Profile:
- Goal: ${profile.goal || "Not set"}
- Current Role: ${profile.role || "Not set"}
- Experience: ${profile.experience || "Not set"}
- Stack: ${(profile.stack || []).join(", ") || "Not set"}

Latest Submission:
${JSON.stringify(payload, null, 2)}

Return only valid JSON with this exact shape:
{
  "summary": "One short personalized paragraph",
  "improvementSuggestions": ["3 concise actions"],
  "bestPractices": ["3 concise best practices"],
  "guidedPath": [
    {"step": 1, "title": "Short step title", "action": "Specific next action"},
    {"step": 2, "title": "Short step title", "action": "Specific next action"},
    {"step": 3, "title": "Short step title", "action": "Specific next action"},
    {"step": 4, "title": "Short step title", "action": "Specific next action"}
  ]
}
`;

        try {
            const completion = await this.requestCompletion([
                { role: "system", content: "You are a strict JSON generator for personalized learning feedback." },
                { role: "user", content: prompt }
            ], "submission coaching");

            const raw = completion.choices[0].message.content;
            const coaching = this.parseJsonFromModel(raw);
            return { success: true, coaching };
        } catch (error) {
            console.error("AgentOrchestrator Submission Coaching Error:", error);
            return {
                success: true,
                coaching: this.buildFallbackSubmissionCoaching(profile, payload),
                fallback: true,
                details: error.message
            };
        }
    }

    logActivity(message) {
        console.log(`[AgentOrchestrator] ${message}`);
        this.recentActivity.unshift({
            message,
            timestamp: new Date()
        });

        // Maintain a limited history in memory
        if (this.recentActivity.length > 100) {
            this.recentActivity = this.recentActivity.slice(0, 100);
        }
    }
}
