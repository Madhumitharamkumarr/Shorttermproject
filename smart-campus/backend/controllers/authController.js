const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Student or Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { role, email, password, ...studentDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: role || 'student',
    });

    if (user.role === 'student') {
      // Validate student specific fields
      const { name, registerNumber, department, phone, dob, address, cgpa, skills } = studentDetails;
      if (!name || !registerNumber || !department || !phone || !dob || !address || !cgpa || !skills) {
        // Rollback user creation
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ message: 'Please provide all mandatory student details' });
      }

      await Student.create({
        user: user._id,
        name,
        registerNumber,
        department,
        phone,
        dob,
        address,
        cgpa,
        skills,
        ...studentDetails
      });
    }

    res.status(201).json({
      _id: user.id,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (user && (await user.matchPassword(password))) {
        res.json({
          _id: user.id,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error during login' });
    }
  };

module.exports = {
  registerUser,
  loginUser,
};
