const User = require('../models/User');

// ─── GET /api/v1/users ────────────────────────────────────────────────────────
// Access: SuperAdmin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshTokenHash');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── DELETE /api/v1/users/:id ─────────────────────────────────────────────────
// Access: SuperAdmin only
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent SuperAdmin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── PATCH /api/v1/users/:id/role ─────────────────────────────────────────────
// Access: SuperAdmin only
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['SuperAdmin', 'Manager', 'Employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshTokenHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllUsers, deleteUser, updateUserRole };
