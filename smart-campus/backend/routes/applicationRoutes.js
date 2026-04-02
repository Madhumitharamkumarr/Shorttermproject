const express = require('express');
const router = express.Router();
const { applyForCompany, getMyApplications, updateApplicationStatus, getAllApplications } = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getAllApplications);

router.route('/my')
  .get(protect, getMyApplications);

router.route('/:id')
  .put(protect, admin, updateApplicationStatus);

router.route('/:companyId')
  .post(protect, applyForCompany);

module.exports = router;
