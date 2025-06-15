const express = require('express');
const router = express.Router();

const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/remindersController');

// @route   GET /api/reminders
// @desc    Get all non-deleted reminders
router.get('/', getReminders);

// @route   POST /api/reminders
// @desc    Create a new reminder
router.post('/', createReminder);

// @route   PUT /api/reminders/:id
// @desc    Update an existing reminder
router.put('/:id', updateReminder);

// @route   DELETE /api/reminders/:id
// @desc    Soft delete a reminder
router.delete('/:id', deleteReminder);

module.exports = router;
