const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private (Student & Admin)
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({});
    res.json(companies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Private
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (company) {
      res.json(company);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a company
// @route   POST /api/companies
// @access  Private (Admin)
const createCompany = async (req, res) => {
  try {
    const company = new Company({
      ...req.body
    });
    const createdCompany = await company.save();
    res.status(201).json(createdCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a company
// @route   PUT /api/companies/:id
// @access  Private (Admin)
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (company) {
      Object.assign(company, req.body);
      const updatedCompany = await company.save();
      res.json(updatedCompany);
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (company) {
      await company.deleteOne();
      res.json({ message: 'Company removed' });
    } else {
      res.status(404).json({ message: 'Company not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
};
