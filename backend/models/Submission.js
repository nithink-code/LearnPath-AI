import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assessment"
  },
  answers: [String],
  score: Number,
  aiFeedback: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Submission", submissionSchema);
