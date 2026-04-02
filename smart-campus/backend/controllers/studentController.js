const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get logged in student profile
// @route   GET /api/students/profile
// @access  Private (Student)
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('user', 'email role');

    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
const updateStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (student) {
      // Update fields
      student.name = req.body.name || student.name;
      student.phone = req.body.phone || student.phone;
      student.address = req.body.address || student.address;
      student.cgpa = req.body.cgpa || student.cgpa;
      student.skills = req.body.skills || student.skills;
      student.certifications = req.body.certifications || student.certifications;
      student.projects = req.body.projects || student.projects;
      student.github = req.body.github || student.github;
      student.linkedin = req.body.linkedin || student.linkedin;
      student.leetcode = req.body.leetcode || student.leetcode;
      student.resumeUrl = req.body.resumeUrl || student.resumeUrl;

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: 'Student profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin)
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).populate('user', 'email');
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (Admin)
const getStudentById = async (req, res) => {
    try {
      const student = await Student.findById(req.params.id).populate('user', 'email');
      if (student) {
          res.json(student);
      } else {
          res.status(404).json({ message: 'Student not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudents,
  getStudentById
};
