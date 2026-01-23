const express = require("express");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongo");
const { escapeHtml, calculateStats, generateCourseInfo, isValidObjectId } = require("../utils");

const router = express.Router();
const COLLECTION = "courses";

router.get("/courses", async (req, res) => {
  try {
    const col = await getCollection(COLLECTION);
    const items = await col.find({}).toArray();

    const coursesList =
      items
        .map((it) => {
          const pct = Math.round(((it.enrolled || 0) / (it.capacity || 1)) * 100) || 0;
          const id = String(it._id);
          return `
          <div class="course-card">
            <div class="course-card-header">
              <h2>${escapeHtml(it.title || "N/A")}</h2>
              <span class="course-code">${escapeHtml(it.code || "N/A")}</span>
            </div>
            <div class="course-card-body">
              <p class="course-description">${escapeHtml(it.description || "No description")}</p>
              <div class="course-meta">
                <div class="course-meta-item"><strong>${escapeHtml(it.credits || "-")} </strong><small>Credits</small></div>
                <div class="course-meta-item"><strong>${escapeHtml(it.instructor || "-")} </strong><small>Instructor</small></div>
              </div>
              <div class="course-meta">
                <div class="course-meta-item"><strong>${escapeHtml(it.schedule || "-")} </strong><small>Times</small></div>
                <div class="course-meta-item"><strong>${escapeHtml(it.room || "-")} </strong><small>Location</small></div>
              </div>
              <div class="enrollment-status"><strong>${it.enrolled || 0}/${it.capacity || 0} </strong> Students Enrolled
                <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%;"></div></div>
              </div>
            </div>
            <div class="course-card-footer">
              <a class="btn btn-primary" href="/courses/${id}">View & Enroll</a>
              <button class="btn btn-delete" onclick="deleteCourse('${id}')">Delete Course</button>
            </div>  
          </div>
        `;
        })
        .join("\n") || "<p>No courses found.</p>";

    const templatePath = path.join(__dirname, "../views", "courses.html");
    fs.readFile(templatePath, "utf8", (err, template) => {
      if (err) {
        console.error("Error reading courses template:", err);
        return res.status(500).send("Error loading courses page");
      }

      let html = template.replace(/{{COURSES_LIST}}/g, coursesList);
      res.send(html);
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Error loading courses");
  }
});

router.get("/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).send(`
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
          <h2>Invalid Course ID</h2>
          <p>The provided course ID is invalid.</p>
          <p><a href="/courses">Back to Courses</a></p>
        </div>
      `);
    }

    const candidate = path.join(__dirname, "../views", id + ".html");
    fs.access(candidate, fs.constants.R_OK, (err) => {
      if (!err) return res.sendFile(candidate);

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

          const courseData = { ...item, id: String(item._id) };

          const stats = calculateStats(courseData);

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
