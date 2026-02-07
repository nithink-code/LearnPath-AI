
export class AgentOrchestrator {
    constructor(client) {
        this.client = client;
        this.studyMaterials = [];
        this.recentActivity = [];
        // Default model used in the application
        this.model = "zai-org/GLM-4.7-Flash:novita";
    }

    async processEvent({ type, data }) {
        const timestamp = new Date().toISOString();
        const activity = { type, timestamp, details: data };

        this.logActivity(`Event received: ${type}`);

        // Here you could add logic to analyze the event with AI
        // For now, we'll just acknowledge it
        return {
            success: true,
            message: "Event processed",
            timestamp
        };
    }

    async requestHelp(text) {
        this.logActivity(`Help requested: ${text.substring(0, 50)}...`);

        try {
            const completion = await this.client.chat.completions.create({
                model: this.model, // Using the same model as server.js
                messages: [
                    { role: "system", content: "You are a helpful AI study assistant. Provide clear and concise answers to the student's questions." },
                    { role: "user", content: text }
                ],
            });

            const answer = completion.choices[0].message.content;
            return { success: true, response: answer };
        } catch (error) {
            console.error("AgentOrchestrator Help Error:", error);
            return {
                success: false,
                error: "Failed to get AI response",
                details: error.message
            };
        }
    }

    addStudyMaterial(material) {
        // material structure: { topic, content, keywords }
        const newMaterial = {
            id: Date.now().toString(),
            timestamp: new Date(),
            ...material
        };

        this.studyMaterials.push(newMaterial);
        this.logActivity(`Added study material: ${material.topic}`);
        return newMaterial;
    }

    getStudyMaterials() {
        return this.studyMaterials;
    }

    getRecentActivity() {
        // Return the last 50 activities
        return this.recentActivity.slice(0, 50);
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
