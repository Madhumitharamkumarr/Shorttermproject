const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  cgpa: { type: Number, required: true },
  skills: { type: [String], required: true },
  certifications: { type: [String] },
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  github: { type: String },
  linkedin: { type: String },
  leetcode: { type: String },
  resumeUrl: { type: String } // Path to PDF
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
