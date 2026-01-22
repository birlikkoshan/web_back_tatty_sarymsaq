const express = require("express");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongo");
const { escapeHtml, calculateStats, generateCourseInfo, isValidObjectId } = require("../utils");

const router = express.Router();
const COLLECTION = "courses";

// GET /courses - Render courses page (data loaded via fetch from frontend)
router.get("/courses", async (req, res) => {
  try {
    // Load template and replace placeholder with empty content (will be loaded via fetch)
    const templatePath = path.join(__dirname, "../views", "courses.html");
    fs.readFile(templatePath, "utf8", (err, template) => {
      if (err) {
        console.error("Error reading courses template:", err);
        return res.status(500).send("Error loading courses page");
      }

      // Replace placeholder with loading message - frontend will fetch and render data
      let html = template.replace(/{{COURSES_LIST}}/g, '<p style="text-align: center; color: #666; grid-column: 1/-1;">Loading courses...</p>');
      res.send(html);
    });
  } catch (error) {
    console.error("Error loading courses page:", error);
    res.status(500).send("Error loading courses page");
  }
});

// GET /courses/:id - Display course enrollment details
router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return res.status(400).send(`
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
          <h2>Invalid Course ID</h2>
          <p>The provided course ID is invalid.</p>
          <p><a href="/courses">Back to Courses</a></p>
        </div>
      `);
    }

    // Check if static file exists first
    const candidate = path.join(__dirname, "../views", id + ".html");
    fs.access(candidate, fs.constants.R_OK, (err) => {
      if (!err) return res.sendFile(candidate);

      // Load from database if static file doesn't exist
      (async () => {
        try {
          const col = await getCollection(COLLECTION);
          const item = await col.findOne({ _id: new ObjectId(id) });

          if (!item) {
            return res.status(404).send(`
              <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
                <h2>Course Not Found</h2>
                <p>Course with ID ${escapeHtml(id)} does not exist.</p>
                <p><a href="/courses">Back to Courses</a></p>
              </div>
            `);
          }

          // Convert _id to id for frontend
          const courseData = { ...item, id: String(item._id) };

          // Calculate stats
          const stats = calculateStats(courseData);

          // Load template and render
          const enrollmentPath = path.join(__dirname, "../views", "enrollment.html");
          fs.readFile(enrollmentPath, "utf8", (err, template) => {
            if (err) {
              console.error("Error reading enrollment template:", err);
              return res.status(500).send("Error loading course details");
            }
            const courseInfo = generateCourseInfo(courseData, stats);
            let html = template.replace(/{{COURSE_INFO}}/g, courseInfo);
            html = html.replace(/{{COURSE_TITLE}}/g, escapeHtml(courseData.title || "Course"));
            res.send(html);
          });
        } catch (error) {
          console.error("Error fetching course:", error);
          return res.status(500).send(`
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
              <h2>Error</h2>
              <p>An error occurred while loading the course.</p>
              <p><a href="/courses">Back to Courses</a></p>
            </div>
          `);
        }
      })();
    });
  } catch (error) {
    console.error("Error in course detail route:", error);
    res.status(500).send("Error loading course details");
  }
});

module.exports = router;
