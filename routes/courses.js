const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /courses - Render courses page with all courses
router.get("/courses", (req, res) => {
  // Fetch all courses from API endpoint
  fetch('http://localhost:3000/api/courses')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    })
    .then(items => {
      // Generate course cards HTML
      const coursesList = items.map((it) => {
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
            <div class="course-card-footer">
              <a class="btn btn-primary" href="/courses/${it.id}">View & Enroll</a>
              <button class="btn btn-delete" onclick="deleteCourse('${it.id}')">Delete Course</button>
            </div>  
          </div>
        `;
      })
      .join("\n") || "<p>No courses found.</p>";

      // Load template and replace placeholder
      const templatePath = path.join(__dirname, "../views", "courses.html");
      fs.readFile(templatePath, "utf8", (err, template) => {
        if (err) {
          console.error("Error reading courses template:", err);
          return res.status(500).send("Error loading courses page");
        }

        let html = template.replace(/{{COURSES_LIST}}/g, coursesList);
        res.send(html);
      });
    })
    .catch(error => {
      console.error("Error fetching courses:", error);
      res.status(500).send("Error loading courses");
    });
});

module.exports = router;
