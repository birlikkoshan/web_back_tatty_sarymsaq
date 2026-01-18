const express = require("express");
const path = require("path");
require("dotenv").config();

// Import route modules
const pagesRoutes = require("./routes/pages");
const coursesPageRoutes = require("./routes/courses");
const courseApiRoutes = require("./routes/apiCourses");
const itemsRoutes = require("./routes/items");
const contactRoutes = require("./routes/contact");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Pages
app.use(pagesRoutes);

app.use(coursesPageRoutes);
app.use(itemsRoutes);

// app.use("/api/course", courseApiRoutes);
app.use("/api/courses", courseApiRoutes);

app.use(contactRoutes); // POST /contact

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(404).sendFile(path.join(__dirname, "views/not_found.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
