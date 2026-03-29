import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: "Untitled Note" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
