const express = require('express');
const router = express.Router();
const { getMockTests, getMockTestById, createMockTest } = require('../controllers/mockTestController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, getMockTests)
    .post(protect, admin, createMockTest);

router.route('/:id')
    .get(protect, getMockTestById);

module.exports = router;
