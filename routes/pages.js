const express = require("express");
const path = require("path");

const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

// About page
router.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/about.html"));
});

// Contact page
router.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/contact.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});
router.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/signup.html"));
});

module.exports = router;
