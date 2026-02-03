const express = require("express");
const contactController = require("../controllers/contactController");

const router = express.Router();

router.post("/contact", contactController.submit);

module.exports = router;
