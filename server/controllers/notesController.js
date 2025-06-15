const Note = require('../models/Note');
const Label = require('../models/Label');

// Get all notes (optionally include deleted using ?deleted=true)
exports.getNotes = async (req, res) => {
  try {
    const isDeleted = req.query.deleted === 'true';
    const notes = await Note.find({ deleted: isDeleted }).sort({ pinned: -1, createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

// ✅ Get soft-deleted notes only
exports.getTrashedNotes = async (req, res) => {
  try {
    const trashedNotes = await Note.find({ deleted: true }).sort({ createdAt: -1 });
    res.status(200).json(trashedNotes);
  } catch (err) {
    console.error('Error fetching trashed notes:', err);
    res.status(500).json({ error: 'Failed to fetch trashed notes' });
  }
};

// Create a new note
exports.createNote = async (req, res) => {
  try {
    const {
      content = '',
      x = 100,
      y = 100,
      color = '#fff8dc',
      font = 'sans-serif',
      pinned = false,
      labels = []
    } = req.body;

    for (const labelName of labels) {
      const exists = await Label.findOne({ name: labelName });
      if (!exists) {
        await new Label({ name: labelName }).save();
      }
    }

    const newNote = new Note({ content, x, y, color, font, pinned, labels });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(400).json({ error: 'Failed to create note' });
  }
};

// Update a note
exports.updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const updateData = req.body;

    if (updateData.labels) {
      for (const labelName of updateData.labels) {
        const exists = await Label.findOne({ name: labelName });
        if (!exists) {
          await new Label({ name: labelName }).save();
        }
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error('Error updating note:', err);
    res.status(400).json({ error: 'Failed to update note' });
  }
};

// Soft delete or permanently delete note
exports.deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const forceDelete = req.query.force === 'true';

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (forceDelete || !note.content?.trim()) {
      await Note.findByIdAndDelete(noteId);
      return res.status(200).json({ message: 'Note permanently deleted' });
    }

    const deletedNote = await Note.findByIdAndUpdate(
      noteId,
      { deleted: true },
      { new: true }
    );

    res.status(200).json({ message: 'Note soft-deleted successfully', data: deletedNote });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(400).json({ error: 'Failed to delete note' });
  }
};

// Restore a soft-deleted note
exports.restoreNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    const restoredNote = await Note.findByIdAndUpdate(
      noteId,
      { deleted: false },
      { new: true }
    );

    if (!restoredNote) {
      return res.status(404).json({ error: 'Note not found for restore' });
    }

    res.status(200).json({ message: 'Note restored successfully', data: restoredNote });
  } catch (err) {
    console.error('Error restoring note:', err);
    res.status(400).json({ error: 'Failed to restore note' });
  }
};
