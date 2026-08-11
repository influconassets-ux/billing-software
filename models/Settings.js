const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  advocateName: { type: String, default: 'Rhiddhiman Mukherjee' },
  designation: { type: String, default: 'Advocate' },
  court: { type: String, default: 'High Court at Calcutta' },
  briefedBy: { type: String, default: 'Mr. Rowsan Kumar Jha' },
  bankName: { type: String, default: 'STATE BANK OF INDIA' },
  branch: { type: String, default: 'High Court Spl. Branch' },
  accountNo: { type: String, default: '3756852410' },
  ifsc: { type: String, default: 'SBIN000084' },
  micr: { type: String, default: '700002100' },
  pan: { type: String, default: 'BWMPM155K' },
  clerkName: { type: String, default: 'Subhendu Mal' },
  clerkDesignation: { type: String, default: 'Clerk to' },
  clerkAdvocate: { type: String, default: 'Rhiddhiman Mukherjee' },
  clerkCourt: { type: String, default: 'High Court at Calcutta' },
  residence: { type: String, default: '123/A, Example Street, Kolkata - 700001' },
  phone: { type: String, default: '+91 9876543210' },
  email: { type: String, default: 'advocate@example.com' }
});

module.exports = mongoose.model('Settings', settingsSchema);
