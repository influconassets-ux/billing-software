const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  date: { type: String, required: true },
  memoNo: { type: String },
  court: { type: String },
  briefedBy: { type: String },
  client: { type: String },
  caseName: { type: String },
  items: [{
    nature: { type: String },
    gm: { type: String },
    fees: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
