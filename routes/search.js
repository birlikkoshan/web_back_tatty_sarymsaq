const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /search - File-based search functionality
router.get("/search", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  if (!q) {
    return res.send(
      `<h2>Search</h2><form method="get" action="/search"><input name="q" placeholder="search..."><button>Search</button></form>`
    );
  }

  const viewDir = path.join(__dirname, "../views");
  fs.readdir(viewDir, (err, files) => {
    if (err) return res.status(500).send("Server error");
    const matches = files.filter((f) => f.toLowerCase().includes(q));

    if (matches.length === 0) {
      return res.send(
        `<h2>No results for "${q}"</h2><p><a href="/">Back</a></p>`
      );
    }

    const list = matches
      .map((m) => `<li><a href="/${path.parse(m).name}">${path.parse(m).name}</a></li>`)
      .join("");

    res.send(`<h2>Results for "${q}"</h2><ul>${list}</ul><p><a href="/">Back</a></p>`);
  });
});

module.exports = router;
