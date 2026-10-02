const mongoose = require('mongoose');

const roughBillSchema = new mongoose.Schema({
  date: { type: String, required: true },
  court: { type: String },
  briefedBy: { type: String },
  client: { type: String },
  caseName: { type: String },
  caseNumber: { type: String },
  cor: { type: String },
  items: [{
    nature: { type: String },
    gm: { type: String },
    fees: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoughBill', roughBillSchema);
