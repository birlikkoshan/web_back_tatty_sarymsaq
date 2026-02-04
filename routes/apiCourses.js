const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const apiCoursesController = require("../controllers/apiCoursesController");

const router = express.Router();

router.get(
  "/",
  requireAuth,
  requireRole("student", "admin", "instructor"),
  apiCoursesController.list,
);
router.get(
  "/:id",
  requireAuth,
  requireRole("student", "admin", "instructor"),
  apiCoursesController.getById,
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
  requireRole("student"),
  apiCoursesController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "instructor"),
  apiCoursesController.remove,
);

module.exports = router;
