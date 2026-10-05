const express = require('express');
const router = express.Router();
const { getProfile, getAllEmployees } = require('../controllers/employeeController');
const { protect, checkRole } = require('../middleware/auth');

// GET /api/v1/employee/profile — All authenticated roles
router.get('/profile', protect, getProfile);

// GET /api/v1/employee/all — Manager and SuperAdmin only
router.get('/all', protect, checkRole(['Manager', 'SuperAdmin']), getAllEmployees);

module.exports = router;
