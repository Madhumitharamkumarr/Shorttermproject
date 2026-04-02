const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();
    await Student.deleteMany();
    await Company.deleteMany();

    const adminUser = await User.create({ email: 'admin@smartcampus.com', password: 'password123', role: 'admin' });
    const studentUser = await User.create({ email: 'student@smartcampus.com', password: 'password123', role: 'student' });

    await Student.create({
        user: studentUser._id,
        name: 'John Doe',
        registerNumber: '12345678',
        department: 'Computer Science',
        phone: '1234567890',
        dob: new Date('2000-01-01'),
        address: '123 Campus Drive',
        cgpa: 8.5,
        skills: ['JavaScript', 'React', 'Node.js']
    });

    await Company.create({
        name: 'Tech Corp',
        description: 'Leading software company',
        role: 'Software Engineer',
        eligibilityCriteria: { cgpa: 7.5, departments: ['Computer Science', 'Information Technology'] },
        salary: '10 LPA',
        rounds: ['Aptitude', 'Technical', 'HR'],
        driveDate: new Date('2026-05-01')
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();
