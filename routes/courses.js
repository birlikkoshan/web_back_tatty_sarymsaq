const express = require("express");
const coursesController = require("../controllers/coursesController");

const router = express.Router();

router.get("/courses", coursesController.listPage);
router.get("/courses/:id", coursesController.detailPage);

module.exports = router;
