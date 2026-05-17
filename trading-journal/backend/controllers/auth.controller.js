// =============================================================
// controllers/auth.controller.js - Authentication Controllers
// =============================================================
//
// Lecture 2 Concept: Modular backend architecture
// Lecture 4 Concept: RESTful route naming
//
// CONTROLLERS are the "C" in MVC (Model-View-Controller).
// They handle the business logic for a specific resource.
//
// CONTROLLER RESPONSIBILITIES:
// 1. Receive validated request data (req)
// 2. Call service/model methods to process data
// 3. Return appropriate HTTP response (res)
//
// Controllers should be LEAN - complex logic goes in services
// =============================================================

const User = require("../models/User");
const Notification = require("../models/Notification");

// =============================================================
// HELPER: Send Token Response
// =============================================================
// Reusable function to generate JWT and send response
// DRY principle: used in both register and login
const sendTokenResponse = (user, statusCode, res) => {
  // Generate JWT using the instance method we defined in User model
  const token = user.getSignedJwtToken();

  // Remove password from response object even if it somehow got through
  const userResponse = user.toJSON();

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

// =============================================================
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// =============================================================
const register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email
          ? "Email already registered"
          : "Username already taken",
      });
    }

    // Prevent self-assigning admin role through registration
    // Admins are assigned by other admins only
    const allowedRoles = ["trader", "premium_trader", "strategy_seller"];
    const userRole = allowedRoles.includes(role) ? role : "trader";

    // Create user - password hashing happens in User model pre-save hook
    const user = await User.create({
      username,
      email,
      password,
      role: userRole,
    });

    // Create welcome notification
    await Notification.create({
      recipient: user._id,
      type: "system",
      title: "Welcome to TradingJournal! 🎉",
      message: `Welcome ${username}! Start tracking your trades and improving your performance.`,
    });

    // Send back token + user data
    sendTokenResponse(user, 201, res);
  } catch (error) {
    // Pass error to global error handler (server.js)
    next(error);
  }
};

// =============================================================
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// =============================================================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email - include password field (excluded by default)
    const user = await User.findOne({ email }).select("+password");

    // SECURITY: Use the SAME error message for both "user not found"
    // and "wrong password" - prevents user enumeration attacks
    // (Attacker can't figure out if an email is registered)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated. Contact support.",
      });
    }

    // Compare entered password with hashed password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Update last login time
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// =============================================================
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// =============================================================
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    // We re-fetch from DB to get the latest data
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// =============================================================
// @desc    Logout (client-side only - JWT is stateless)
// @route   POST /api/auth/logout
// @access  Private
// =============================================================
const logout = async (req, res, next) => {
  // JWT is STATELESS - the server doesn't track who's logged in.
  // "Logout" with JWT means the CLIENT deletes their token.
  // The server can't invalidate tokens (without a token blacklist).
  //
  // In production, you might implement token blacklisting with Redis
  // or use short-lived tokens (15 min) + refresh tokens.

  res.status(200).json({
    success: true,
    message: "Logged out successfully - please remove your token",
  });
};

// =============================================================
// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
// =============================================================
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password (hashing happens in pre-save hook)
    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, logout, updatePassword };
