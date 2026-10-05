const express = require('express');
const router = express.Router();
const { approvePayroll, getPayrollList } = require('../controllers/payrollController');
const { protect, checkRole } = require('../middleware/auth');

// POST /api/v1/payroll/approve — Manager and SuperAdmin only
router.post('/approve', protect, checkRole(['Manager', 'SuperAdmin']), approvePayroll);

// GET /api/v1/payroll/list — Manager and SuperAdmin only
router.get('/list', protect, checkRole(['Manager', 'SuperAdmin']), getPayrollList);

module.exports = router;
