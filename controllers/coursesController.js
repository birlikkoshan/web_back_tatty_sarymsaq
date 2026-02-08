const fs = require("fs");
const path = require("path");
const { findCourseById } = require("../models/Course");
const { findUserById } = require("../models/User");
const { escapeHtml, calculateStats, generateCourseInfo, isValidObjectId } = require("../utils");

const VIEWS_DIR = path.join(__dirname, "../views");

function sendErrorPage(res, status, title, message) {
  return res.status(status).send(`
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 20px auto; padding: 20px;">
      <h2>${title}</h2>
      <p>${message}</p>
      <p><a href="/courses">Back to Courses</a></p>
    </div>
  `);
}

function listPage(req, res) {
  const role = req.session?.role;
  const templateFile =
    role === "admin"
      ? "admin-courses.html"
      : role === "instructor"
        ? "instructor-courses.html"
        : "student-courses.html";
  const templatePath = path.join(VIEWS_DIR, templateFile);
  fs.readFile(templatePath, "utf8", (err, template) => {
    if (err) {
      console.error("Error reading courses template:", err);
      return res.status(500).send("Error loading courses page");
    }
    const html = template.replace(
      /{{COURSES_LIST}}/g,
      '<div class="loader-container"><div class="loader-spinner"></div><span class="loader-text">Loading courses...</span></div>'
    );
    res.send(html);
  });
}

function detailPage(req, res) {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendErrorPage(res, 400, "Invalid Course ID", "The provided course ID is invalid.");
  }

  const staticPath = path.join(VIEWS_DIR, id + ".html");
  fs.access(staticPath, fs.constants.R_OK, (err) => {
    if (!err) return res.sendFile(staticPath);

    (async () => {
      try {
        const item = await findCourseById(id);
        if (!item) {
          return sendErrorPage(
            res,
            404,
            "Course Not Found",
            `Course with ID ${escapeHtml(id)} does not exist.`
          );
        }

        const courseData = { ...item, id: String(item._id) };
        if (item.instructorId) {
          const instructor = await findUserById(String(item.instructorId));
          if (instructor) {
            courseData.instructor = [instructor.firstname, instructor.surname].filter(Boolean).join(" ").trim() || instructor.email || "N/A";
            courseData.email = instructor.email || "";
          }
        }
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
          html = html.replace(/{{USER_ROLE}}/g, escapeHtml(req.session?.role || "student"));
          html = html.replace(/{{USER_ID}}/g, escapeHtml(req.session?.userId || ""));
          res.send(html);
        });
      } catch (error) {
        console.error("Error fetching course:", error);
        return sendErrorPage(res, 500, "Error", "An error occurred while loading the course.");
      }
    })();
  });
}

module.exports = {
  listPage,
  detailPage,
};
