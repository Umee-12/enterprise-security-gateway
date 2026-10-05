const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  compareToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require('../utils/tokenUtils');
const jwt = require('jsonwebtoken');

// ─── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // Validate role (only allow Employee/Manager in self-registration)
    const allowedRoles = ['Employee', 'Manager'];
    const userRole = allowedRoles.includes(role) ? role : 'Employee';

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      authProvider: 'local',
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Hash and store refresh token
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Fetch user with password
    const user = await User.findOne({ email }).select('+password +refreshTokenHash +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if OAuth-only account
    if (user.authProvider !== 'local' && !user.password) {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.authProvider} login. Please sign in with ${user.authProvider}.`,
      });
    }

    // Check account lockout
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account locked due to too many failed attempts. Try again in ${remainingTime} minute(s).`,
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();

      const attemptsLeft = 5 - (user.loginAttempts + 1);
      return res.status(401).json({
        success: false,
        message:
          attemptsLeft > 0
            ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
            : 'Invalid credentials. Account is now locked for 15 minutes.',
      });
    }

    // Reset login attempts on success
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Hash and store refresh token (rotation)
    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
// POST /api/v1/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided.',
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Fetch user with stored hash
    const user = await User.findById(decoded.id).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token revoked or user not found.',
      });
    }

    // Validate stored hash matches incoming token
    const isValid = await compareToken(token, user.refreshTokenHash);
    if (!isValid) {
      // Possible token reuse attack — revoke all
      user.refreshTokenHash = undefined;
      await user.save({ validateBeforeSave: false });
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Refresh token reuse detected. Please log in again.',
      });
    }

    // ─── Token Rotation: Issue new pair ──────────────────────────────────────
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokenHash = await hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
// POST /api/v1/auth/logout
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Decode without verifying to get user ID
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        // Revoke stored refresh token
        await User.findByIdAndUpdate(decoded.id, {
          $unset: { refreshTokenHash: 1 },
        });
      }
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── OAuth Callback Handler ───────────────────────────────────────────────────
// Called after Passport.js completes OAuth flow
const oauthCallback = async (req, res) => {
  try {
    const user = req.user;

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokenHash = await hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend with access token as query param
    // Frontend should immediately store this in memory and clear from URL
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth/callback?token=${accessToken}&role=${user.role}&name=${encodeURIComponent(user.name)}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
// GET /api/v1/auth/me
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      authProvider: req.user.authProvider,
    },
  });
};

module.exports = { register, login, refreshToken, logout, oauthCallback, getMe };
