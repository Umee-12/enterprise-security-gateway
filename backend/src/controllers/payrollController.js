// ─── POST /api/v1/payroll/approve ─────────────────────────────────────────────
// Access: Manager and SuperAdmin only
const approvePayroll = async (req, res) => {
  try {
    const { employeeId, amount, month } = req.body;

    if (!employeeId || !amount || !month) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, amount, and month are required.',
      });
    }

    // In a real app this would save to DB
    res.status(200).json({
      success: true,
      message: `Payroll of $${amount} approved for employee ${employeeId} for ${month}.`,
      approvedBy: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── GET /api/v1/payroll/list ─────────────────────────────────────────────────
// Access: Manager and SuperAdmin only
const getPayrollList = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payroll list retrieved.',
    data: [
      { id: 1, employee: 'John Doe', amount: 5000, month: 'September 2026', status: 'approved' },
      { id: 2, employee: 'Jane Smith', amount: 6000, month: 'September 2026', status: 'pending' },
    ],
  });
};

module.exports = { approvePayroll, getPayrollList };
