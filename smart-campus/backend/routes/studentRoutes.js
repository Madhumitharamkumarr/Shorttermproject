const express = require('express');
const router = express.Router();
const { getStudentProfile, updateStudentProfile, getStudents, getStudentById } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getStudents);

router.route('/profile')
    .get(protect, getStudentProfile)
    .put(protect, updateStudentProfile);

router.route('/:id')
    .get(protect, admin, getStudentById);

module.exports = router;
