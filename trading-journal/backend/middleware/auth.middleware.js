// =============================================================
// middleware/auth.middleware.js - Authentication & Authorization
// =============================================================
//
// Lecture 5 Auth Concept: JWT authentication middleware
// Lecture 5 Concept: Express middleware
//
// WHAT IS MIDDLEWARE?
// Middleware functions run BETWEEN receiving a request and
// sending a response. They have access to (req, res, next).
//
// Calling next() passes control to the NEXT middleware in the chain.
// NOT calling next() stops the request here (e.g., when unauthorized).
//
// THE MIDDLEWARE PIPELINE FOR A PROTECTED ROUTE:
// Request → protect() → authorize() → Controller → Response
//
// WHY MIDDLEWARE FOR AUTH?
// Instead of checking "is user logged in?" in EVERY controller,
// we write it ONCE as middleware and apply it to routes that need it.
// DRY principle: Don't Repeat Yourself.
// =============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =============================================================
// PROTECT MIDDLEWARE - Verify JWT Token
// =============================================================
// This middleware verifies that a valid JWT token is present
// It runs before any protected route handler
const protect = async (req, res, next) => {
  let token;

  // JWT tokens are sent in the Authorization header as:
  // "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  // We check for this format
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Extract the token part (remove "Bearer " prefix)
    token = req.headers.authorization.split(" ")[1];
  }

  // Could also check cookies if using cookie-based auth:
  // else if (req.cookies.token) { token = req.cookies.token; }

  // If no token is found, reject the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized - no token provided",
    });
  }

  try {
    // jwt.verify() does TWO things:
    // 1. Verifies the token was signed with our JWT_SECRET (not tampered)
    // 2. Checks the token hasn't expired
    // Returns the decoded payload: { id, role, username, iat, exp }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the current user to the request object
    // Now req.user is available in ALL downstream middleware and controllers
    // We use .select('-password') to exclude the password field
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized - user no longer exists",
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // All checks passed! Move to the next middleware/controller
    next();
  } catch (error) {
    // jwt.verify() throws if token is invalid or expired
    let message = "Not authorized - invalid token";

    if (error.name === "TokenExpiredError") {
      message = "Token expired - please login again";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token - please login again";
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

// =============================================================
// AUTHORIZE MIDDLEWARE - Role-Based Access Control (RBAC)
// =============================================================
//
// This is a MIDDLEWARE FACTORY - a function that RETURNS middleware.
// We pass the required roles and it returns the middleware function.
//
// Usage: authorize('admin') or authorize('admin', 'premium_trader')
//
// EXAMPLE USAGE IN ROUTES:
// router.get('/admin/users', protect, authorize('admin'), getUsers)
// →  protect runs first (verify JWT)
// →  authorize runs second (check role)
// →  getUsers runs third (if both pass)
// =============================================================
const authorize = (...roles) => {
  // Return the actual middleware function
  return (req, res, next) => {
    // req.user was set by the protect middleware above
    // If somehow authorize runs without protect, this would fail
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
        requiredRoles: roles,
      });
    }

    // Role is authorized, proceed!
    next();
  };
};

// =============================================================
// OWNERSHIP MIDDLEWARE
// =============================================================
// Verifies the current user OWNS the resource they're modifying
// This ensures users can't edit/delete other users' trades!
//
// Usage: verifyOwnership(Trade, 'trade')
// This is a factory function - it takes a Model and creates middleware
const verifyOwnership = (Model, resourceName = "resource") => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceName} not found`,
        });
      }

      // Determine the owner field (trades use 'createdBy', strategies use 'author')
      const ownerId = resource.createdBy || resource.author;

      // Admins can access any resource
      // Other users can only access their OWN resources
      if (req.user.role !== "admin" && ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: `You do not have permission to modify this ${resourceName}`,
        });
      }

      // Attach resource to request for use in controller (avoids double DB query)
      req.resource = resource;
      next();
    } catch (error) {
      next(error); // Pass to global error handler
    }
  };
};

// Optional auth - sets req.user if token present, but doesn't block if not
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // Invalid token - just continue without user
      req.user = null;
    }
  }

  next(); // Always continue, even without valid token
};

module.exports = { protect, authorize, verifyOwnership, optionalAuth };
