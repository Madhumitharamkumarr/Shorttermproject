const express = require('express');
const router = express.Router();
const { getCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, getCompanies)
  .post(protect, admin, createCompany);

router.route('/:id')
  .get(protect, getCompanyById)
  .put(protect, admin, updateCompany)
  .delete(protect, admin, deleteCompany);

module.exports = router;
