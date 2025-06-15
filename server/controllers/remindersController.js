const Reminder = require('../models/Reminder');

// GET all reminders (excluding soft-deleted)
exports.getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ deleted: false }).sort({ dueDate: 1 });
    res.status(200).json(reminders);
  } catch (err) {
    console.error('Error fetching reminders:', err);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
};

// CREATE a new reminder
exports.createReminder = async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ message: 'Title and Due Date are required.' });
  }

  try {
    const newReminder = new Reminder({ title, description, dueDate });
    const saved = await newReminder.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating reminder:', err);
    res.status(400).json({ message: 'Failed to create reminder' });
  }
};

// UPDATE a reminder (mark done / edit)
exports.updateReminder = async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating reminder:', err);
    res.status(400).json({ message: 'Failed to update reminder' });
  }
};

// SOFT DELETE a reminder
exports.deleteReminder = async (req, res) => {
  try {
    const updated = await Reminder.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Reminder not found for delete' });
    }
    res.status(200).json({ message: 'Reminder soft-deleted', data: updated });
  } catch (err) {
    console.error('Error deleting reminder:', err);
    res.status(400).json({ message: 'Failed to delete reminder' });
  }
};
