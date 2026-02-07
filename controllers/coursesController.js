const fs = require("fs");
const path = require("path");
const { findCourseById } = require("../models/Course");
const { escapeHtml, calculateStats, generateCourseInfo, isValidObjectId } = require("../utils");

const VIEWS_DIR = path.join(__dirname, "../views");

function listPage(req, res) {
  const role = localStorage.getItem("role");
  if (role === "admin") {
    const templatePath = path.join(VIEWS_DIR, "admin-courses.html");
    fs.readFile(templatePath, "utf8", (err, template) => {
      if (err) {
        console.error("Error reading admin-courses template:", err);
        return res.status(500).send("Error loading admin-courses page");
      }
      res.send(template);
    });
  } else {
    const templatePath = path.join(VIEWS_DIR, "courses.html");
    fs.readFile(templatePath, "utf8", (err, template) => {
      if (err) {
        console.error("Error reading admin-courses template:", err);
        return res.status(500).send("Error loading admin-courses page");
      }
      res.send(template);
    });
  }
}

function detailPage(req, res) {
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

  const staticPath = path.join(VIEWS_DIR, id + ".html");
  fs.access(staticPath, fs.constants.R_OK, (err) => {
    if (!err) return res.sendFile(staticPath);

    (async () => {
      try {
        const item = await findCourseById(id);
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
        const enrollmentPath = path.join(VIEWS_DIR, "enrollment.html");

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
}

module.exports = {
  listPage,
  detailPage,
};
