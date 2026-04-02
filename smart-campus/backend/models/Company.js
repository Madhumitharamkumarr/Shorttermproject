const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  role: { type: String, required: true },
  eligibilityCriteria: {
    cgpa: { type: Number, required: true },
    departments: { type: [String], required: true }, // e.g., ["CSE", "IT", "ECE"]
  },
  salary: { type: String, required: true },
  rounds: { type: [String], required: true }, // e.g. ["Aptitude", "Technical", "HR"]
  driveDate: { type: Date, required: true },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
