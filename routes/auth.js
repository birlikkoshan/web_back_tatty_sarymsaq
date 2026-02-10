const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.me);
router.get(
  "/instructors",
  requireAuth,
  requireRole("admin"),
  authController.listInstructors,
);
router.post(
  "/instructors",
  requireAuth,
  requireRole("admin"),
  authController.createInstructor,
);

module.exports = router;
