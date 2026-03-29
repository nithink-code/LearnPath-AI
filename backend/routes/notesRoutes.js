import express from "express";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/clerkMiddleware.js";

const router = express.Router();

// Get all notes for current user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const notes = await Note.find({ userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("GET /notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new note
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { title, content } = req.body;
    
    if (!content) return res.status(400).json({ error: "Content is required" });
    
    const note = new Note({ userId, title: title || "Untitled Note", content });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error("POST /notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update a note
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { title, content } = req.body;
    
    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json(note);
  } catch (err) {
    console.error("PUT /notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    
    const note = await Note.findOneAndDelete({ _id: id, userId });
    
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
