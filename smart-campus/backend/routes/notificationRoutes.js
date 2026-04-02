const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  respondToNotification,
  getResponsesForNotification
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .post(protect, admin, createNotification)
  .get(protect, getNotifications);

router.route('/:id/respond')
  .post(protect, respondToNotification);

router.route('/:id/responses')
  .get(protect, admin, getResponsesForNotification);

module.exports = router;
