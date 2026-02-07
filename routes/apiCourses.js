const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");
const apiCoursesController = require("../controllers/apiCoursesController");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("student", "admin", "instructor"),
  apiCoursesController.list,
);
router.get(
  "/:id/students",
  requireAuth,
  requireRole("admin", "instructor"),
  apiCoursesController.getCourseStudents,
);
router.get(
  "/:id",
  requireAuth,
  requireRole("student", "admin", "instructor"),
  apiCoursesController.getById,
);
router.post(
  "/:id/enroll",
  requireAuth,
  requireRole("student"),
  apiCoursesController.enroll,
);
router.post(
  "/:id/assign/:studentId",
  requireAuth,
  requireRole("instructor"),
  apiCoursesController.assignStudent,
);
router.post(
  "/:id/add-student",
  requireAuth,
  requireRole("instructor"),
  apiCoursesController.addStudent,
);
router.post(
  "/:id/drop",
  requireAuth,
  requireRole("student"),
  apiCoursesController.drop,
);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "instructor"),
  apiCoursesController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  apiCoursesController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "instructor"),
  apiCoursesController.remove,
);

module.exports = router;
