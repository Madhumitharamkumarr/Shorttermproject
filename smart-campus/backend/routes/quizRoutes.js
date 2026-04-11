const express = require('express');
const router = express.Router();
const { pasteQuizText } = require('../controllers/quizController');

// Using standard endpoint: /api/quiz/paste
// Assuming no protect middleware needed for admin-paste in this context if not strictly required,
// but we can add it if needed. Leaving public for easy testing based on user specs.
router.post('/paste', pasteQuizText);

module.exports = router;
