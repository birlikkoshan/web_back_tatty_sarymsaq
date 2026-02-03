const express = require("express");
const pagesController = require("../controllers/pagesController");

const router = express.Router();

router.get("/", pagesController.home);
router.get("/about", pagesController.about);
router.get("/contact", pagesController.contactPage);
router.get("/login", pagesController.loginPage);
router.get("/signup", pagesController.signupPage);

module.exports = router;
