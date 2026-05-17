// routes/user.routes.js
const express = require("express");
const router  = express.Router();
const {
  getPublicProfile, updateProfile, getAllUsers,
  updateUserRole, toggleUserStatus,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/profile/:username", getPublicProfile);
router.patch("/profile", protect, updateProfile);
router.get(  "/",        protect, authorize("admin"), getAllUsers);
router.patch("/:id/role",          protect, authorize("admin"), updateUserRole);
router.patch("/:id/toggle-status", protect, authorize("admin"), toggleUserStatus);

module.exports = router;
