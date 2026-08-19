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
  clerkPhone: { type: String, default: '70447 79122' },
  clerkBankName: { type: String, default: 'INDIAN BANK' },
  clerkBranch: { type: String, default: 'MADHUSUDANPUR BRANCH, HOOGLY' },
  clerkAccountNo: { type: String, default: '50518782873' },
  clerkIfsc: { type: String, default: 'IDIB000M528' },
  clerkMicr: { type: String, default: '700019216' },
  clerkPan: { type: String, default: 'DBMPM1314R' },
  residence: { type: String, default: '123/A, Example Street, Kolkata - 700001' },
  phone: { type: String, default: '+91 9876543210' },
  email: { type: String, default: 'advocate@example.com' },
  forgotPasswordPhone: { type: String, default: '+919339919973' }
});

module.exports = mongoose.model('Settings', settingsSchema);
