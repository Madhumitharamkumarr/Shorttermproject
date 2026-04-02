const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { check } = require('express-validator');

// Registration validation rules
const registerValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginUser);

module.exports = router;
