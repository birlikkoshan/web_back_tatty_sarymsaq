const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const config = require("./config");
const pagesRoutes = require("./routes/pages");
const coursesPageRoutes = require("./routes/courses");
const courseApiRoutes = require("./routes/apiCourses");
const contactRoutes = require("./routes/contact");
const authRoutes = require("./routes/auth");

const app = express();

app.set("trust proxy", 1);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (!config.sessionSecret || config.sessionSecret === "dev_secret_change_me") {
  console.warn(
    "WARNING: SESSION_SECRET is not set. Set it in Railway env for security."
  );
}

app.use(
  session({
    name: config.sessionCookieName,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
      dbName: config.dbName,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7, // 7 days
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Pages
app.use(pagesRoutes);

// Course pages
app.use(coursesPageRoutes);

// API routes
app.use("/api/courses", courseApiRoutes);
app.use("/api", authRoutes);

app.use(contactRoutes); // POST /contact

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found" });
  }
  return res.status(404).sendFile(path.join(__dirname, "views/not_found.html"));
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
