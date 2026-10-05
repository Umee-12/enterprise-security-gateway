const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, checkRole } = require('../middleware/auth');

// All routes below: SuperAdmin only
router.use(protect, checkRole(['SuperAdmin']));

// GET /api/v1/users
router.get('/', getAllUsers);

// DELETE /api/v1/users/:id
router.delete('/:id', deleteUser);

// PATCH /api/v1/users/:id/role
router.patch('/:id/role', updateUserRole);

module.exports = router;
