import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: String,
  totalSolved: {
    type: Number,
    default: 0
  },
  dailyStreak: {
    type: Number,
    default: 0
  },
  lastSolvedDate: Date
});

export default mongoose.model("Progress", progressSchema);
