const express = require("express");
const path = require("path");

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('database.db')
db.run(`CREATE TABLE IF NOT EXISTS Courses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    credits INTEGER,
    description TEXT,
    instructor_id INTEGER,
    capacity INTEGER,
    enrolled INTEGER,
    prerequisites TEXT)`)


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

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount route modules
app.use(pagesRoutes);           // /, /about, /contact
app.use(coursesRoutes); // /courses, /api/courses
app.use(itemsRoutes);           // /item/:id
app.use(contactRoutes);         // POST /contact
app.use(searchRoutes);          // /search
app.use(apiRoutes);             // /api/info

// 404 Not Found handler (must be last)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views/not_found.html"));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

