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
  findCoursesPaginated,
  countCourses,
  findCourseById,
  findCourseByIdProjection,
  insertCourse,
  updateCourse,
  deleteCourse,
  incrementEnrollment,
  decrementEnrollment,
} = require("../models/Course");
const { findUserById } = require("../models/User");

async function list(req, res) {
  try {
    const filter = buildFilter(req.query);
    const sort = parseSort(req.query.sort);
    const projection = parseFields(req.query.fields);
    const pageRaw = Number(req.query.page);
    const limitRaw = Number(req.query.limit);
    const hasPagination = Number.isFinite(pageRaw) || Number.isFinite(limitRaw);

    if (!hasPagination) {
      const docs = await findCourses(filter, sort, projection);
      return res.status(200).json(docs.map(toPublic));
    }

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 6;
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const [docs, total] = await Promise.all([
      findCoursesPaginated(filter, sort, projection, skip, safeLimit),
      countCourses(filter),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return res.status(200).json({
      items: docs.map(toPublic),
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    });
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

async function enroll(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const existing = await findCourseByIdProjection(id, {
      capacity: 1,
      enrolled: 1,
    });
    if (!existing) return res.status(404).json({ error: "Not Found" });

    const capacity = existing.capacity ?? 0;
    const enrolled = existing.enrolled ?? 0;
    if (enrolled >= capacity) {
      return res.status(409).json({ error: "Course is full" });
    }

    const updated = await incrementEnrollment(id);
    if (!updated) {
      return res.status(409).json({ error: "Course is full" });
    }
    return res.status(200).json(toPublic(updated));
  } catch (err) {
    console.error("Error in POST /api/courses/:id/enroll:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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

async function drop(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const existing = await findCourseByIdProjection(id, { enrolled: 1 });
    if (!existing) return res.status(404).json({ error: "Not Found" });

    const enrolled = existing.enrolled ?? 0;
    if (enrolled <= 0) {
      return res.status(409).json({ error: "No active enrollments to drop" });
    }

    const updated = await decrementEnrollment(id);
    if (!updated) {
      return res.status(409).json({ error: "No active enrollments to drop" });
    }
    return res.status(200).json(toPublic(updated));
  } catch (err) {
    console.error("Error in POST /api/courses/:id/drop:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addStudent(req, res) {
  try {
    const { id } = req.params;
    const { studentId } = req.body || {};

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid course id" });
    }
    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }

    const student = await findUserById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const existing = await findCourseByIdProjection(id, {
      capacity: 1,
      enrolled: 1,
    });
    if (!existing) return res.status(404).json({ error: "Not Found" });

    const capacity = existing.capacity ?? 0;
    const enrolled = existing.enrolled ?? 0;
    if (enrolled >= capacity) {
      return res.status(409).json({ error: "Course is full" });
    }

    const updated = await incrementEnrollment(id);
    if (!updated) {
      return res.status(409).json({ error: "Course is full" });
    }
    return res.status(200).json({
      ok: true,
      message: "Student added to course",
      course: toPublic(updated),
    });
  } catch (err) {
    console.error("Error in POST /api/courses/:id/add-student:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  enroll,
  addStudent,
  drop,
  remove,
};
