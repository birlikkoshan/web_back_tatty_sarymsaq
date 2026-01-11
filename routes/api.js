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

router.post("/api/courses", (req, res) => {
  const { title, code, credits, description, instructor, email, schedule, room, capacity, enrolled, prerequisites } = req.body;
  
  // Validate required fields
  if (!title || !code) {
    return res.status(400).json({ error: "Title and Code are required" });
  }

  // Insert into SQLite database
  db.serialize(() => {
    db.run(
      `INSERT INTO Courses (title, code, credits, description, instructor_id, capacity, enrolled, prerequisites) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, code, parseInt(credits) || 0, description, 1, parseInt(capacity) || 0, parseInt(enrolled) || 0, prerequisites || "None"],
      function(err) {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Could not save course to database" });
        }

        // Also add to items.json for compatibility
        const itemsPath = path.join(__dirname, "../items.json");
        fs.readFile(itemsPath, "utf8", (err, data) => {
          let items = [];
          if (!err) {
            try {
              items = JSON.parse(data);
            } catch (e) {
              console.log("Warning: Could not parse items.json");
            }
          }

          const newId = this.lastID;
          const newCourse = {
            id: newId,
            title,
            type: "course",
            code,
            credits: parseInt(credits) || 0,
            description,
            instructor,
            email,
            schedule,
            room,
            capacity: parseInt(capacity) || 0,
            enrolled: parseInt(enrolled) || 0,
            prerequisites: prerequisites || "None"
          };

          items.push(newCourse);
          fs.writeFile(itemsPath, JSON.stringify(items, null, 2), (err) => {
            if (err) {
              console.log("Warning: Could not update items.json");
            }
            res.status(201).json({ success: true, course: newCourse });
          });
        });
      }
    );
  });
});

module.exports = router;
