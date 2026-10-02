const express = require('express');
const router = express.Router();
const RoughBill = require('../models/RoughBill');

// Get all rough bills
router.get('/', async (req, res) => {
  try {
    const roughBills = await RoughBill.find().sort({ createdAt: -1 });
    res.json(roughBills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new rough bill
router.post('/', async (req, res) => {
  const roughBill = new RoughBill(req.body);
  try {
    const newRoughBill = await roughBill.save();
    res.status(201).json(newRoughBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a rough bill
router.put('/:id', async (req, res) => {
  try {
    const updatedRoughBill = await RoughBill.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updatedRoughBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a rough bill
router.delete('/:id', async (req, res) => {
  try {
    await RoughBill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rough bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
