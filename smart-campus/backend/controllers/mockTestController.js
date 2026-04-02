const MockTest = require('../models/MockTest');

// @desc    Get all mock tests
// @route   GET /api/mocktests
// @access  Private
const getMockTests = async (req, res) => {
    try {
        const mockTests = await MockTest.find({}).populate('companyId', 'name');
        res.json(mockTests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get mock test by ID
// @route   GET /api/mocktests/:id
// @access  Private
const getMockTestById = async (req, res) => {
    try {
        const mockTest = await MockTest.findById(req.params.id).populate('companyId', 'name');
        if (mockTest) {
            res.json(mockTest);
        } else {
            res.status(404).json({ message: 'Mock Test not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a mock test
// @route   POST /api/mocktests
// @access  Private (Admin)
const createMockTest = async (req, res) => {
    try {
        const mockTest = new MockTest({
            title: req.body.title,
            type: req.body.type,
            companyId: req.body.companyId,
            questions: req.body.questions,
            duration: req.body.duration
        });
        const createdTest = await mockTest.save();
        res.status(201).json(createdTest);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMockTests,
    getMockTestById,
    createMockTest
};
