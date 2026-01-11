const express = require("express");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("database.db");

const router = express.Router();

// GET /api/info - API info route: returns project info in JSON
router.get("/api/info", (req, res) => {
  const pkgPath = path.join(__dirname, "../package.json");
  fs.readFile(pkgPath, "utf8", (err, data) => {
    if (err) {
      return res.json({
        name: path.basename(path.join(__dirname, "..")),
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    }

    try {
      const pkg = JSON.parse(data);
      return res.json({
        name: pkg.name || path.basename(path.join(__dirname, "..")),
        version: pkg.version,
        description: pkg.description,
        routes: ["/", "/search", "/item/:id", "/contact", "/api/info"],
      });
    } catch (e) {
      return res.status(500).json({ error: "invalid package.json" });
    }
  });
});

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

function validateCourseBody(body) {
  const errors = [];

  const title = body?.title;
  const description = body?.description;

  if (!title || String(title).trim() === "") errors.push("title is required");
  if (!description || String(description).trim() === "")
    errors.push("description is required");

  // code: optional text
  if (body?.code !== undefined && body?.code !== null) {
    if (typeof body.code !== "string") errors.push("code must be a string");
  }

  // credits/capacity/enrolled: integers >= 0
  const credits = body?.credits === undefined ? 0 : Number(body.credits);
  const capacity = body?.capacity === undefined ? 0 : Number(body.capacity);
  const enrolled = body?.enrolled === undefined ? 0 : Number(body.enrolled);

  if (!Number.isInteger(credits) || credits < 0)
    errors.push("credits must be a non-negative integer");

  if (!Number.isInteger(capacity) || capacity < 0)
    errors.push("capacity must be a non-negative integer");

  if (!Number.isInteger(enrolled) || enrolled < 0)
    errors.push("enrolled must be a non-negative integer");

  if (Number.isInteger(capacity) && Number.isInteger(enrolled)) {
    if (enrolled > capacity) errors.push("enrolled cannot exceed capacity");
  }

  return errors;
}

// GET /api/courses - все записи (id ASC)
router.get("/api/courses", (req, res) => {
  db.all("SELECT * FROM courses ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Database error" });
    return res.status(200).json(rows);
  });
});

// GET /api/courses/:id - одна запись
router.get("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  db.get("SELECT * FROM courses WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Course not found" });
    return res.status(200).json(row);
  });
});

// POST /api/courses - создать
router.post("/api/courses", (req, res) => {
  const errors = validateCourseBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  const title = String(req.body.title).trim();
  const description = String(req.body.description).trim();
  const code =
    req.body.code === undefined ||
    req.body.code === null ||
    String(req.body.code).trim() === ""
      ? null
      : String(req.body.code).trim();

  const credits = req.body.credits === undefined ? 0 : Number(req.body.credits);
  const capacity =
    req.body.capacity === undefined ? 0 : Number(req.body.capacity);
  const enrolled =
    req.body.enrolled === undefined ? 0 : Number(req.body.enrolled);

  const sql = `
    INSERT INTO courses (title, description, code, credits, capacity, enrolled)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description, code, credits, capacity, enrolled],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });

      db.get(
        "SELECT * FROM courses WHERE id = ?",
        [this.lastID],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          return res.status(201).json(row);
        }
      );
    }
  );
});

// PUT /api/courses/:id - обновить
router.put("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  const errors = validateCourseBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") });

  const title = String(req.body.title).trim();
  const description = String(req.body.description).trim();
  const code =
    req.body.code === undefined ||
    req.body.code === null ||
    String(req.body.code).trim() === ""
      ? null
      : String(req.body.code).trim();

  const credits = req.body.credits === undefined ? 0 : Number(req.body.credits);
  const capacity =
    req.body.capacity === undefined ? 0 : Number(req.body.capacity);
  const enrolled =
    req.body.enrolled === undefined ? 0 : Number(req.body.enrolled);

  db.get("SELECT id FROM courses WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Course not found" });

    const sql = `
      UPDATE courses
      SET title = ?, description = ?, code = ?, credits = ?, capacity = ?, enrolled = ?
      WHERE id = ?
    `;

    db.run(
      sql,
      [title, description, code, credits, capacity, enrolled, id],
      function (err2) {
        if (err2) return res.status(500).json({ error: "Database error" });

        db.get("SELECT * FROM courses WHERE id = ?", [id], (err3, updated) => {
          if (err3) return res.status(500).json({ error: "Database error" });
          return res.status(200).json(updated);
        });
      }
    );
  });
});

// DELETE /api/courses/:id - удалить
router.delete("/api/courses/:id", (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" });

  db.get("SELECT id FROM courses WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Course not found" });

    db.run("DELETE FROM courses WHERE id = ?", [id], function (err2) {
      if (err2) return res.status(500).json({ error: "Database error" });
      return res.status(200).json({ message: "Deleted" });
    });
  });
});

module.exports = router;
