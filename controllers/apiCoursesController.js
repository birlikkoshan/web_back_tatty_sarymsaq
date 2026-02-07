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
  addStudentToCourse,
  removeStudentFromCourse,
  findCoursesContainingStudent,
} = require("../models/Course");
const { findUserById, findUsersByIds } = require("../models/User");

const MAX_COURSES_PER_STUDENT = 5;
const MAX_NON_MAJOR_COURSES = 2;

function ensureInstructorOwnsCourse(req, res, course) {
  const role = (req.session?.role || "").toLowerCase();
  if (role === "admin") return true;
  if (role !== "instructor") return true;
  const courseInstructorId = course?.instructorId ? String(course.instructorId) : "";
  const userId = req.session?.userId ? String(req.session.userId) : "";
  if (!courseInstructorId || courseInstructorId !== userId) {
    res.status(403).json({ error: "Not accessible for your role" });
    return false;
  }
  return true;
}

async function checkEnrollmentLimits(studentId, newCourseDepartment) {
  const student = await findUserById(studentId);
  if (!student) return { ok: false, error: "Student not found" };
  const studentDept = (student.department || "").toLowerCase();
  const newDept = (newCourseDepartment || "").toLowerCase();

  const enrolledCourses = await findCoursesContainingStudent(studentId);
  if (enrolledCourses.length >= MAX_COURSES_PER_STUDENT) {
    return {
      ok: false,
      error: `Cannot enroll in more than ${MAX_COURSES_PER_STUDENT} courses`,
    };
  }
  const nonMajorCount = enrolledCourses.filter((c) => {
    const courseDept = (c.department || "").toLowerCase();
    return courseDept !== studentDept;
  }).length;
  const thisIsNonMajor = newDept !== studentDept;
  if (thisIsNonMajor && nonMajorCount >= MAX_NON_MAJOR_COURSES) {
    return {
      ok: false,
      error: `Cannot enroll in more than ${MAX_NON_MAJOR_COURSES} courses outside your major (department)`,
    };
  }
  return { ok: true };
}

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

async function getCourseStudents(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const course = await findCourseByIdProjection(id, { studentIds: 1, instructorId: 1 });
    if (!course) return res.status(404).json({ error: "Not Found" });
    if (!ensureInstructorOwnsCourse(req, res, course)) return;

    const ids = course.studentIds || [];
    if (ids.length === 0) {
      return res.status(200).json([]);
    }

    const users = await findUsersByIds(ids, {
      firstname: 1,
      surname: 1,
      email: 1,
      department: 1,
    });
    const byId = new Map(users.map((u) => [String(u._id), u]));
    const list = ids.map((oid) => {
      const u = byId.get(String(oid));
      return u
        ? {
            id: String(u._id),
            firstname: u.firstname,
            surname: u.surname,
            email: u.email,
            department: u.department || "",
          }
        : { id: String(oid), firstname: "", surname: "", email: "", department: "" };
    });
    return res.status(200).json(list);
  } catch (err) {
    console.error("Error in GET /api/courses/:id/students:", err);
    return res.status(500).json({ error: "Internal Server Error" });
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

    const role = (req.session?.role || "").toLowerCase();
    const doc = { ...parsed.doc };
    if (role === "instructor" && req.session?.userId) {
      doc.instructorId = req.session.userId;
    } else if (parsed.doc.instructorId) {
      doc.instructorId = parsed.doc.instructorId;
    }

    const created = await insertCourse(doc);
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
    const studentId = req.session?.userId;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const course = await findCourseByIdProjection(id, {
      capacity: 1,
      enrolled: 1,
      studentIds: 1,
      department: 1,
    });
    if (!course) return res.status(404).json({ error: "Not Found" });

    const studentIds = course.studentIds || [];
    if (studentIds.some((sid) => String(sid) === studentId)) {
      return res.status(409).json({ error: "Already enrolled in this course" });
    }

    const capacity = course.capacity ?? 0;
    if (studentIds.length >= capacity) {
      return res.status(409).json({ error: "Course is full" });
    }

    const limits = await checkEnrollmentLimits(studentId, course.department);
    if (!limits.ok) {
      return res.status(409).json({ error: limits.error });
    }

    const updated = await addStudentToCourse(id, studentId);
    if (!updated) {
      const recheck = await findCourseByIdProjection(id, { studentIds: 1 });
      const ids = recheck?.studentIds || [];
      if (ids.some((sid) => String(sid) === studentId)) {
        const fullCourse = await findCourseById(id);
        return res.status(200).json(toPublic(fullCourse));
      }
      return res.status(409).json({ error: "Course is full or already enrolled" });
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

    const course = await findCourseByIdProjection(id, { instructorId: 1 });
    if (course && !ensureInstructorOwnsCourse(req, res, course)) return;

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
    const studentId = req.session?.userId;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid id" });
    }
    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const course = await findCourseByIdProjection(id, { studentIds: 1 });
    if (!course) return res.status(404).json({ error: "Not Found" });

    const studentIds = course.studentIds || [];
    if (!studentIds.some((sid) => String(sid) === studentId)) {
      return res.status(409).json({ error: "Not enrolled in this course" });
    }

    const updated = await removeStudentFromCourse(id, studentId);
    if (!updated) {
      const recheck = await findCourseByIdProjection(id, { studentIds: 1 });
      const ids = recheck?.studentIds || [];
      if (!ids.some((sid) => String(sid) === studentId)) {
        const fullCourse = await findCourseById(id);
        return res.status(200).json(toPublic(fullCourse));
      }
      return res.status(409).json({ error: "Not enrolled in this course" });
    }
    return res.status(200).json(toPublic(updated));
  } catch (err) {
    console.error("Error in POST /api/courses/:id/drop:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function assignStudent(req, res) {
  try {
    const { id, studentId } = req.params;
    return addStudentLogic(req, res, id, studentId);
  } catch (err) {
    console.error("Error in POST /api/courses/:id/assign/:studentId:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addStudent(req, res) {
  try {
    const { id } = req.params;
    const { studentId } = req.body || {};
    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }
    return addStudentLogic(req, res, id, studentId);
  } catch (err) {
    console.error("Error in POST /api/courses/:id/add-student:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addStudentLogic(req, res, courseId, studentId) {
  try {
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ error: "Invalid course id" });
    }

    const student = await findUserById(studentId);
    if (!student || (student.role || "").toLowerCase() !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const course = await findCourseByIdProjection(courseId, {
      capacity: 1,
      enrolled: 1,
      studentIds: 1,
      department: 1,
      instructorId: 1,
    });
    if (!course) return res.status(404).json({ error: "Not Found" });
    if (!ensureInstructorOwnsCourse(req, res, course)) return;

    const studentIds = course.studentIds || [];
    if (studentIds.some((sid) => String(sid) === studentId)) {
      return res.status(409).json({ error: "Student already assigned to this course" });
    }

    const capacity = course.capacity ?? 0;
    if (studentIds.length >= capacity) {
      return res.status(409).json({ error: "Course is full" });
    }

    const limits = await checkEnrollmentLimits(studentId, course.department);
    if (!limits.ok) {
      return res.status(409).json({ error: limits.error });
    }

    const updated = await addStudentToCourse(courseId, studentId);
    if (!updated) {
      return res.status(409).json({ error: "Course is full or student already assigned" });
    }
    return res.status(200).json({
      ok: true,
      message: "Student added to course",
      course: toPublic(updated),
    });
  } catch (err) {
    console.error("Error in addStudentLogic:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function removeStudentByInstructor(req, res) {
  try {
    const { id, studentId } = req.params;
    if (!isValidObjectId(id) || !isValidObjectId(studentId)) {
      return res.status(400).json({ error: "Invalid id or studentId" });
    }

    const course = await findCourseByIdProjection(id, { instructorId: 1, studentIds: 1 });
    if (!course) return res.status(404).json({ error: "Not Found" });
    if (!ensureInstructorOwnsCourse(req, res, course)) return;

    const updated = await removeStudentFromCourse(id, studentId);
    if (!updated) {
      return res.status(409).json({ error: "Student not enrolled in this course" });
    }
    return res.status(200).json({
      ok: true,
      message: "Student removed from course",
      course: toPublic(updated),
    });
  } catch (err) {
    console.error("Error in POST /api/courses/:id/remove-student/:studentId:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  list,
  getById,
  getCourseStudents,
  create,
  update,
  enroll,
  addStudent,
  assignStudent,
  removeStudentByInstructor,
  drop,
  remove,
};
