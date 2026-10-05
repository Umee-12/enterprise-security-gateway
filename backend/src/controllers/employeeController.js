const User = require('../models/User');

// ─── GET /api/v1/employee/profile ─────────────────────────────────────────────
// Access: All authenticated roles (SuperAdmin, Manager, Employee)
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/v1/employee/all ─────────────────────────────────────────────────
// Access: Manager, SuperAdmin
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' }).select('-password -refreshTokenHash');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getProfile, getAllEmployees };
