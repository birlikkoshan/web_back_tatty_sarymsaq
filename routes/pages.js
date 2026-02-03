const express = require("express");
const pagesController = require("../controllers/pagesController");
const { requireAuth } = require("../middleware/requireAuth");

const router = express.Router();

router.get("/", pagesController.home);
router.get("/about", pagesController.about);
router.get("/contact", pagesController.contactPage);
router.get("/login", pagesController.loginPage);
router.get("/signup", pagesController.signupPage);
router.get("/profile", requireAuth, pagesController.profilePage);

module.exports = router;
