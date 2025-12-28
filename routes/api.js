const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/info - API info route: returns project info in JSON
router.get("/api/info", (req, res) => {
  const pkgPath = path.join(__dirname, "../package.json");
  fs.readFile(pkgPath, "utf8", (err, data) => {
    if (err) {
      return res.json({
        name: path.basename(path.join(__dirname, "..")),
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    }

    try {
      const pkg = JSON.parse(data);
      return res.json({
        name: pkg.name || path.basename(path.join(__dirname, "..")),
        version: pkg.version,
        description: pkg.description,
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    } catch (e) {
      return res.status(500).json({ error: "invalid package.json" });
    }
  });
});

module.exports = router;
