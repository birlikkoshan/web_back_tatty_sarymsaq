const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3")

const db = new sqlite3.Database('database.db')

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

router.get("/api/courses", (req,res) => {
  db.serialize(()=>{
    db.all('SELECT id, title, code, credits, description FROM Courses ORDER BY id ASC', function(err,rows){     
      if(err){
        res.status(500).send("Error encountered while displaying");
        console.log(err)
      }
      res.status(200).json(rows);
    });
  });
})

router.delete("/api/courses/:id", (req,res) => {
  if (!Number.isInteger(req.params.id)){
    res.status(400).end("Invalid route parameter")
  }
  db.serialize(() => {
    db.run(`DELETE FROM Courses WHERE id = ?`,req.params.id,(err) => {
      if(err){
        res.status(500).send(err);
      } else {
        res.status(200).end();
      }
    })
  })
})

module.exports = router;
