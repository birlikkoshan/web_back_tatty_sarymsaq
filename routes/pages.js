const express = require("express");
const pagesController = require("../controllers/pagesController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/requireRole");

const router = express.Router();

router.get("/", pagesController.home);
router.get("/about", pagesController.about);
router.get("/contact", pagesController.contactPage);
router.get("/login", pagesController.loginPage);
router.get("/signup", pagesController.signupPage);
router.get("/profile", requireAuth, pagesController.profilePage);
router.get("/my-courses", requireAuth, pagesController.myCoursesStudentPage);
router.get(
  "/instructor-courses",
  requireAuth,
  requireRole("instructor"),
  pagesController.instructorCoursesPage,
);

module.exports = router;
