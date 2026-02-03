const express = require("express");
const { requireAuth } = require("../middleware/requireAuth");
const apiCoursesController = require("../controllers/apiCoursesController");

const router = express.Router();

router.get("/", apiCoursesController.list);
router.get("/:id", apiCoursesController.getById);
router.post("/", requireAuth, apiCoursesController.create);
router.put("/:id", requireAuth, apiCoursesController.update);
router.delete("/:id", requireAuth, apiCoursesController.remove);

module.exports = router;
