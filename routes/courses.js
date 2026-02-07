const express = require("express");
const coursesController = require("../controllers/coursesController");
const { requireAuth } = require("../middleware/requireAuth");
const router = express.Router();

router.get("/courses", coursesController.listPage);
router.get("/courses/:id", requireAuth, coursesController.detailPage);

module.exports = router;
