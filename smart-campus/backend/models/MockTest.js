const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Quiz', 'Coding'], required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  questions: [{
    questionText: { type: String, required: true },
    options: [{ type: String }], // For Quiz
    correctAnswer: { type: String }, // For Quiz
    problemStatement: { type: String }, // For Coding
    boilerplateCode: { type: String }, // For Coding
    testCases: [{
      input: String,
      expectedOutput: String
    }] // For Coding
  }],
  duration: { type: Number, required: true } // in minutes
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);
