const {
  isValidObjectId,
  toPublic,
  parseSort,
  parseFields,
  buildFilter,
  validateCreateBody,
  validateUpdateBody,
} = require("../utils");
const {
  findCourses,
  findCourseById,
  findCourseByIdProjection,
  insertCourse,
  updateCourse,
  deleteCourse,
} = require("../models/Course");

async function list(req, res) {
  try {
    const filter = buildFilter(req.query);
    const sort = parseSort(req.query.sort);
    const projection = parseFields(req.query.fields);

    const docs = await findCourses(filter, sort, projection);
    res.status(200).json(docs.map(toPublic));
  } catch (err) {
    console.error("Error in GET /api/courses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const doc = await findCourseById(id);
    if (!doc) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(toPublic(doc));
  } catch (err) {
    console.error("Error in GET /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function create(req, res) {
  try {
    const parsed = validateCreateBody(req.body);
    if (!parsed.ok) {
      return res
        .status(400)
        .json({ error: "Bad Request", details: parsed.errors });
    }

    const created = await insertCourse(parsed.doc);
    res.status(201).json(toPublic(created));
  } catch (err) {
    console.error("Error in POST /api/courses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const parsed = validateUpdateBody(req.body);
    if (!parsed.ok) {
      return res
        .status(400)
        .json({ error: "Bad Request", details: parsed.errors });
    }

    if (
      parsed.update.enrolled !== undefined ||
      parsed.update.capacity !== undefined
    ) {
      const existing = await findCourseByIdProjection(id, {
        capacity: 1,
        enrolled: 1,
      });
      if (!existing) return res.status(404).json({ error: "Not Found" });

      const capacity =
        parsed.update.capacity !== undefined
          ? parsed.update.capacity
          : existing.capacity;
      const enrolled =
        parsed.update.enrolled !== undefined
          ? parsed.update.enrolled
          : existing.enrolled;

      if (
        capacity !== undefined &&
        enrolled !== undefined &&
        enrolled > capacity
      ) {
        return res.status(400).json({
          error: "Bad Request",
          details: ["enrolled cannot be greater than capacity"],
        });
      }
    }

    const updated = await updateCourse(id, parsed.update);
    if (!updated) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(toPublic(updated));
  } catch (err) {
    console.error("Error in PUT /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const deleted = await deleteCourse(id);
    if (!deleted) return res.status(404).json({ error: "Not Found" });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error in DELETE /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
