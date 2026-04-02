const Application = require('../models/Application');
const Student = require('../models/Student');

// @desc    Apply for a company
// @route   POST /api/applications/:companyId
// @access  Private (Student)
const applyForCompany = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
    }

    const applicationExists = await Application.findOne({ studentId: student._id, companyId: req.params.companyId });
    if (applicationExists) {
        return res.status(400).json({ message: 'Already applied' });
    }

    const application = new Application({
      studentId: student._id,
      companyId: req.params.companyId,
      rounds: [],
      finalStatus: 'Applied'
    });

    const createdApplication = await application.save();
    res.status(201).json(createdApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get applications for logged in student
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user._id });
        if (!student) return res.status(404).json({ message: 'Not found' });

        const applications = await Application.find({ studentId: student._id }).populate('companyId');
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update application status / round tracking
// @route   PUT /api/applications/:id
// @access  Private (Admin)
const updateApplicationStatus = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);
        if (application) {
            // Update rounds or finalStatus
            if (req.body.rounds) {
                application.rounds = req.body.rounds;
            }
            if (req.body.finalStatus) {
                application.finalStatus = req.body.finalStatus;
            }
            
            const updatedApp = await application.save();
            res.json(updatedApp);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all applications (with filters)
// @route   GET /api/applications
// @access  Private (Admin)
const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find({}).populate('studentId').populate('companyId');
        res.json(applications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  applyForCompany,
  getMyApplications,
  updateApplicationStatus,
  getAllApplications
};
