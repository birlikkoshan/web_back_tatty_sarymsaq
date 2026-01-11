const express = require("express");
const path = require("path");

// Import route modules
const pagesRoutes = require("./routes/pages");
const coursesRoutes = require("./routes/courses");
const itemsRoutes = require("./routes/items");
const contactRoutes = require("./routes/contact");
const searchRoutes = require("./routes/search");
const apiRoutes = require("./routes/api");

const app = express();

// Middleware
app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount route modules
app.use(pagesRoutes); // /, /about, /contact
app.use(coursesRoutes); // /courses, /api/courses
app.use(itemsRoutes); // /item/:id
app.use(contactRoutes); // POST /contact
app.use(searchRoutes); // /search
app.use(apiRoutes); // /api/info

const apiCoursesRoutes = require("./routes/apiCourses");
app.use(apiCoursesRoutes);

// 404 Not Found handler (must be last)
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(404).sendFile(path.join(__dirname, "views/not_found.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
