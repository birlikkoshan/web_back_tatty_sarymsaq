const express = require("express");
const db = require("../db");

const router = express.Router();

function isValidId(id) {
  return /^\d+$/.test(String(id));
}

function validateCourseBody(body) {
  const errors = [];
  if (!body.title || String(body.title).trim() === "")
    errors.push("title is required");
  if (!body.description || String(body.description).trim() === "")
    errors.push("description is required");
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
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid id" }); // требование :contentReference[oaicite:3]{index=3}

  db.get("SELECT * FROM courses WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!row) return res.status(404).json({ error: "Course not found" });
    return res.status(200).json(row);
  });
});

// POST /api/courses - создать
router.post("/api/courses", (req, res) => {
  const errors = validateCourseBody(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(", ") }); // требование :contentReference[oaicite:4]{index=4}

  const {
    title,
    description,
    code = null,
    credits = 0,
    capacity = 0,
    enrolled = 0,
  } = req.body;

  const sql = `
    INSERT INTO courses (title, description, code, credits, capacity, enrolled)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [title, description, code, credits, capacity, enrolled],
    function (err) {
      if (err) return res.status(500).json({ error: "Database error" });

      // Вернём созданный объект
      db.get(
        "SELECT * FROM courses WHERE id = ?",
        [this.lastID],
        (err2, row) => {
          if (err2) return res.status(500).json({ error: "Database error" });
          return res.status(201).json(row); // 201 Created :contentReference[oaicite:5]{index=5}
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

  const {
    title,
    description,
    code = null,
    credits = 0,
    capacity = 0,
    enrolled = 0,
  } = req.body;

  // Сначала проверим существование
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
