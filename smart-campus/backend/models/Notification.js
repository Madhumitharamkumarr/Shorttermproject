const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Company Arrival', 'Deadline', 'General'], required: true },
  targetCompanies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
