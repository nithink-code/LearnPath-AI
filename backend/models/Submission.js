import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  // Legacy assessment submissions
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment"
  },
  answers: [String],
  score: Number,
  aiFeedback: String,
  // Quiz / Coding submissions
  submissionType: {
    type: String,
    enum: ['quiz', 'coding'],
  },
  // Coding fields
  code: String,
  language: String,
  problemTitle: String,
  status: {
    type: String,
    enum: ['accepted', 'attempted'],
    default: 'attempted'
  },
  // Quiz fields
  totalQuestions: Number,
  aiCoaching: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Submission", submissionSchema);
