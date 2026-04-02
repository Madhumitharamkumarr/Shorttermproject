const Notification = require('../models/Notification');
const ResponseModel = require('../models/Response'); // Named ResponseModel to avoid conflict with res
const Student = require('../models/Student');

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res) => {
  try {
    const notification = new Notification({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      targetCompanies: req.body.targetCompanies,
      deadline: req.body.deadline
    });
    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all notifications (relevant to student or all for admin)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    let query = {};
    // If student, get notifications that haven't passed deadline heavily, or just all active ones
    const notifications = await Notification.find(query).populate('targetCompanies').sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Respond to a notification
// @route   POST /api/notifications/:id/respond
// @access  Private (Student)
const respondToNotification = async (req, res) => {
  try {
    const { interested, reason } = req.body;
    
    // Reason is mandatory if not interested
    if (!interested && !reason) {
        return res.status(400).json({ message: 'Reason is mandatory if not interested' });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if response already exists
    const existingResponse = await ResponseModel.findOne({ notificationId: req.params.id, studentId: student._id });
    if (existingResponse) {
        return res.status(400).json({ message: 'You have already responded to this notification' });
    }

    const response = new ResponseModel({
        notificationId: req.params.id,
        studentId: student._id,
        interested,
        reason: interested ? '' : reason
    });

    const createdResponse = await response.save();
    res.status(201).json(createdResponse);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get responses for a notification
// @route   GET /api/notifications/:id/responses
// @access  Private (Admin)
const getResponsesForNotification = async (req, res) => {
    try {
        const responses = await ResponseModel.find({ notificationId: req.params.id }).populate('studentId');
        res.json(responses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    respondToNotification,
    getResponsesForNotification
};
