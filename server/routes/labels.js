const express = require('express');
const router = express.Router();
const Label = require('../models/Label');

// GET all labels
router.get('/', async (req, res) => {
  try {
    const labels = await Label.find().sort({ name: 1 }); // optional alphabetical sort
    res.json(labels);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// CREATE new label
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Label name cannot be empty' });
  }

  try {
    const existing = await Label.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Label already exists' });
    }

    const label = new Label({ name: name.trim() });
    await label.save();
    res.status(201).json(label);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// UPDATE label
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Label name cannot be empty' });
    }

    const updated = await Label.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update label' });
  }
});

// DELETE label
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Label.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json({ message: 'Label deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete label' });
  }
});

module.exports = router;
