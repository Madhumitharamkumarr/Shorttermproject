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
    console.log('🗑️  Clearing old data...');
    await User.deleteMany();
    await Student.deleteMany();
    await Company.deleteMany();

    // ── Admin Account ─────────────────────────────────────────────────────────
    await User.create({
      email: 'admin@prepnplace.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created: admin@prepnplace.com / admin123');

    // ── Demo Student Account ──────────────────────────────────────────────────
    const studentUser = await User.create({
      email: 'student1@prepnplace.com',
      password: 'student123',
      role: 'student',
    });

    await Student.create({
      user: studentUser._id,
      name: 'Demo Student',
      registerNumber: 'STU001',
      department: 'MCA',
      phone: '9999999999',
      dob: new Date('2002-01-01'),
      address: 'Kongu Engineering College, Erode',
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
    });
    console.log('✅ Demo student created: student1@prepnplace.com / student123');

    // ── Sample Companies ──────────────────────────────────────────────────────
    await Company.create([
      {
        name: 'Infosys',
        description: 'Global leader in next-generation digital services and consulting.',
        role: 'System Engineer',
        eligibilityCriteria: { cgpa: 6.5, departments: ['MCA', 'CSE', 'IT'] },
        salary: '3.6 LPA',
        rounds: ['Aptitude', 'Technical', 'HR'],
        driveDate: new Date('2026-06-15'),
      },
      {
        name: 'TCS',
        description: 'IT services, consulting and business solutions.',
        role: 'Ninja Developer',
        eligibilityCriteria: { cgpa: 6.0, departments: ['MCA', 'CSE', 'ECE'] },
        salary: '3.36 LPA',
        rounds: ['Aptitude', 'Technical', 'HR'],
        driveDate: new Date('2026-07-01'),
      },
      {
        name: 'Wipro',
        description: 'Leading technology services and consulting company.',
        role: 'Project Engineer',
        eligibilityCriteria: { cgpa: 6.0, departments: ['MCA', 'CSE', 'IT', 'ECE'] },
        salary: '3.5 LPA',
        rounds: ['Aptitude', 'Technical', 'HR'],
        driveDate: new Date('2026-07-20'),
      },
    ]);
    console.log('✅ 3 companies created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────────');
    console.log('Admin:   admin@prepnplace.com / admin123');
    console.log('Student: student1@prepnplace.com / student123');
    console.log('─────────────────────────────────────');
    process.exit();
  } catch (error) {
    console.error('❌ Seeder Error:', error.message);
    process.exit(1);
  }
};

importData();
