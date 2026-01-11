const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Helper function to calculate course stats
function calculateStats(item) {
  const percentage = Math.round((item.enrolled / item.capacity) * 100);
  const spotsRemaining = item.capacity - item.enrolled;
  return { percentage, spotsRemaining };
}

// Helper function to generate course info HTML
function generateCourseInfo(item, stats) {
  return `
    <div class="course-detail-header">
      <h1>${item.title}</h1>
      <span class="course-code-badge">${item.code}</span>
    </div>

    <div class="course-detail-body">
      <div class="course-section">
        <h2>Course Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Credits</strong>
            <p>${item.credits}</p>
          </div>
          <div class="info-item">
            <strong>Enrolled</strong>
            <p>${item.enrolled}/${item.capacity}</p>
          </div>
          <div class="info-item">
            <strong>Capacity</strong>
            <p>${stats.percentage}%</p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Description</h2>
        <p>${item.description}</p>
      </div>

      <div class="course-section">
        <h2>Instructor</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Name</strong>
            <p>${item.instructor}</p>
          </div>
          <div class="info-item">
            <strong>Email</strong>
            <p><a href="mailto:${item.email}">${item.email}</a></p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Schedule & Location</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Times</strong>
            <p>${item.schedule}</p>
          </div>
          <div class="info-item">
            <strong>Room</strong>
            <p>${item.room}</p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Enrollment Status</h2>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.percentage}%;"></div>
        </div>
        <p>${stats.spotsRemaining} spots remaining</p>
      </div>
    </div>

    <div class="course-detail-footer">
      <button class="btn btn-primary" onclick="enrollCourse(${item.id}, ${item.capacity}, ${item.enrolled})">Enroll Now</button>
      <a href="/courses" class="btn btn-secondary">Back to Courses</a>
    </div>
  `;
}

// GET /courses/:id - Display course enrollment details
router.get("/courses/:id", (req, res) => {
  const id = req.params.id;
  const candidate = path.join(__dirname, "../views", id + ".html");

  // Check if static file exists first
  fs.access(candidate, fs.constants.R_OK, (err) => {
    if (!err) return res.sendFile(candidate);

    // Load from API if static file doesn't exist
    fetch(`http://localhost:3000/api/courses/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Course not found');
        }
        return response.json();
      })
      .then(item => {
        // Calculate stats
        const stats = calculateStats(item);

        // Load template and render
        const enrollmentPath = path.join(__dirname, "../views", "enrollment.html");
        fs.readFile(enrollmentPath, "utf8", (err, template) => {
          if (err) {
            console.error("Error reading enrollment template:", err);
            return res.status(500).send("Error loading course details");
          }

          const courseInfo = generateCourseInfo(item, stats);
          const html = template.replace(/{{COURSE_INFO}}/g, courseInfo);
          res.send(html);
        });
      })
      .catch(error => {
        console.error("Error fetching course:", error);
        return res.status(404).send(`
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
            <h2>Course Not Found</h2>
            <p>Course with ID ${id} does not exist.</p>
            <p><a href="/courses">Back to Courses</a></p>
          </div>
        `);
      });
  });
});

module.exports = router;
