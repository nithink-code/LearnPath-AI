import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema({
  skill: {
    type: String,
    enum: ["DSA", "React", "SQL"],
    required: true
  },
  type: {
    type: String,
    enum: ["quiz", "coding"],
    required: true
  },
  questions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
      starterCode: String,
      expectedOutput: String
    }
  ]
});

export default mongoose.model("Assessment", assessmentSchema);
