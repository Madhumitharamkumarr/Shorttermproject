const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  interested: { type: Boolean, required: true },
  reason: { 
    type: String, 
    required: function() { return !this.interested; } // mandatory if not interested
  }
}, { timestamps: true });

module.exports = mongoose.model('Response', responseSchema);
