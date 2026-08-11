const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Generate Memo No
router.get('/generate-memo', async (req, res) => {
  try {
    const dateStr = req.query.date; // Expected format: DD-MM-YYYY
    if (!dateStr || dateStr.length !== 10) {
      return res.status(400).json({ message: 'Invalid date format. Expected DD-MM-YYYY' });
    }

    const parts = dateStr.split('-');
    const dd = parts[0];
    const mm = parts[1];
    const yyyy = parts[2];

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthIndex = parseInt(mm, 10) - 1;
    const monthName = monthNames[monthIndex];

    // Find all bills for the given year
    const yearRegex = new RegExp(`-${yyyy}$`);
    const billsThisYear = await Bill.find({ date: yearRegex });
    
    // Find all bills for the given month and year
    const monthYearRegex = new RegExp(`-${mm}-${yyyy}$`);
    const billsThisMonth = await Bill.find({ date: monthYearRegex });

    // Assuming we want the next number, we add 1 to the current count
    const yearlyCount = billsThisYear.length + 1;
    const monthlyCount = billsThisMonth.length + 1;

    // Format: 03/01/FEB/2026
    const formattedYearly = String(yearlyCount).padStart(2, '0');
    const formattedMonthly = String(monthlyCount).padStart(2, '0');
    
    const memoNo = `${formattedYearly}/${formattedMonthly}/${monthName}/${yyyy}`;
    
    res.json({ memoNo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all bills (ledger)
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new bill
router.post('/', async (req, res) => {
  const bill = new Bill(req.body);
  try {
    const newBill = await bill.save();
    res.status(201).json(newBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a bill
router.put('/:id', async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a bill (Optional, but good for completeness)
router.delete('/:id', async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear all bills (Equivalent to clearLedger)
router.delete('/', async (req, res) => {
  try {
    await Bill.deleteMany({});
    res.json({ message: 'All bills deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
