const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  rounds: [{
    roundName: { type: String, required: true }, // Aptitude, Technical, HR
    status: { type: String, enum: ['Pending', 'Cleared', 'Rejected'], default: 'Pending' },
    rejectionReason: { type: String, default: '' },
    improvementTips: { type: String, default: '' }
  }],
  finalStatus: { type: String, enum: ['Applied', 'In Progress', 'Selected', 'Rejected'], default: 'Applied' },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
