const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");
const apiCoursesController = require("../controllers/apiCoursesController");

const router = express.Router();

router.get(
  "/:id/students",
  requireAuth,
  requireRole("admin", "instructor"),
  apiCoursesController.getCourseStudents,
);

module.exports = router;
