import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

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
  submissionType: {
    type: String,
    enum: ['quiz', 'coding'],
  },
  code: String,
  language: String,
  problemTitle: String,
  status: {
    type: String,
    enum: ['accepted', 'attempted'],
    default: 'attempted'
  },
  totalQuestions: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const Submission = mongoose.model("Submission", submissionSchema);

async function test() {
  await mongoose.connect(process.env.MONGOURL);
  try {
    await Submission.create({
      userId: 'user_2',
      submissionType: 'coding',
      code: 'function sum() {}',
      language: 'javascript',
      problemTitle: 'Two Sum',
      status: 'accepted',
    });
    console.log("Success");
  } catch (err) {
    console.error("Submission error:", err);
  }
  process.exit(0);
}
test();
