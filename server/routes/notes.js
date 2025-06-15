const express = require('express');
const router = express.Router();
const {
  getNotes,
  getTrashedNotes,  // ✅ Import controller handler
  createNote,
  updateNote,
  deleteNote,
  restoreNote
} = require('../controllers/notesController');

// @route   GET /api/notes
// @desc    Fetch all non-deleted notes
router.get('/', getNotes);

// ✅ REPLACE THIS ↓ inline route with the controller handler
// router.get('/trash', async (req, res) => { ... })

// ✅ USE THIS INSTEAD:
router.get('/trash', getTrashedNotes);

// @route   POST /api/notes
router.post('/', createNote);

// @route   PUT /api/notes/:id
router.put('/:id', updateNote);

// @route   PUT /api/notes/:id/restore
router.put('/:id/restore', restoreNote);

// @route   DELETE /api/notes/:id
router.delete('/:id', deleteNote);

module.exports = router;
