const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database('database.db');
const router = express.Router();

// GET /courses - Render courses page with search and course cards
router.get("/courses", (req, res) => {
  const q = (req.query.q || "").toLowerCase();

  // SQL query to get courses with instructor info
  let sql = `
    SELECT 
      c.id, 
      c.title, 
      c.code, 
      c.credits, 
      c.description, 
      c.capacity, 
      c.enrolled, 
      c.prerequisites,
      i.name as instructor,
      i.email
    FROM Courses c
    LEFT JOIN Instructors i ON c.instructor_id = i.id
    ORDER BY c.id ASC
  `;

  db.serialize(() => {
    db.all(sql, (err, items) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error loading courses");
      }

      // Filter by search query if provided
      let filteredItems = items || [];
      if (q) {
        filteredItems = items.filter((it) => {
          const searchText = (
            it.title + " " + 
            (it.code || "") + " " + 
            (it.instructor || "") + " " + 
            (it.description || "")
          ).toLowerCase();
          return searchText.includes(q);
        });
      }

      // Generate course cards HTML
      const coursesList = filteredItems.map((it) => {
        const pct = Math.round((it.enrolled / it.capacity) * 100) || 0;
        return `
          <div class="course-card">
            <div class="course-card-header">
              <h2>${it.title}</h2>
              <span class="course-code">${it.code || ""}</span>
            </div>
            <div class="course-card-body">
              <p class="course-description">${it.description || ""}</p>
              <div class="course-meta">
                <div class="course-meta-item"><strong>${it.credits || "-"} </strong><small>Credits</small></div>
                <div class="course-meta-item"><strong>${it.instructor || "-"} </strong><small>Instructor</small></div>
              </div>
              <div class="course-meta">
                <div class="course-meta-item"><strong>${it.schedule || "-"} </strong><small>Times</small></div>
                <div class="course-meta-item"><strong>${it.room || "-"} </strong><small>Location</small></div>
              </div>
              <div class="enrollment-status"><strong>${it.enrolled}/${it.capacity} </strong> Students Enrolled
                <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%;"></div></div>
              </div>
            </div>
            <div class="course-card-footer"><a class="btn btn-primary" href="/courses/${it.id}">View & Enroll</a></div>
          </div>
        `;
      })
      .join("\n") || "<p>No courses found.</p>";

      // Load template and replace placeholders
      const templatePath = path.join(__dirname, "../views", "courses.html");
      fs.readFile(templatePath, "utf8", (err, template) => {
        if (err) {
          console.error("Error reading courses template:", err);
          return res.status(500).send("Error loading courses page");
        }

        let html = template
          .replace(/{{SEARCH_QUERY}}/g, q || "")
          .replace(/{{COURSES_LIST}}/g, coursesList);

        res.send(html);
      });
    });
  });
});

module.exports = router;
