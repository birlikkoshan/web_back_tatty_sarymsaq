const express = require("express");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongo");

const router = express.Router();
const COLLECTION = "courses";

// ---------- helpers ----------

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

function toPublic(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function parseSort(sortRaw) {
  if (!sortRaw || typeof sortRaw !== "string") return null;

  const field = sortRaw.startsWith("-") ? sortRaw.slice(1) : sortRaw;
  if (!field) return null;

  const dir = sortRaw.startsWith("-") ? -1 : 1;
  return { [field]: dir };
}

function parseFields(fieldsRaw) {
  // fields=title,credits,code => projection
  if (!fieldsRaw || typeof fieldsRaw !== "string") return null;

  const parts = fieldsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const projection = {};
  for (const f of parts) projection[f] = 1;

  // keep _id so we can output id
  projection._id = 1;
  return projection;
}

function buildFilter(query) {
  const filter = {};

  if (typeof query.type === "string" && query.type.trim() !== "") {
    filter.type = query.type.trim();
  }

  if (typeof query.title === "string" && query.title.trim() !== "") {
    filter.title = { $regex: query.title.trim(), $options: "i" };
  }

  if (typeof query.code === "string" && query.code.trim() !== "") {
    filter.code = { $regex: query.code.trim(), $options: "i" };
  }

  if (typeof query.instructor === "string" && query.instructor.trim() !== "") {
    filter.instructor = { $regex: query.instructor.trim(), $options: "i" };
  }

  const minCredits = Number(query.minCredits);
  const maxCredits = Number(query.maxCredits);
  if (!Number.isNaN(minCredits) || !Number.isNaN(maxCredits)) {
    filter.credits = {};
    if (!Number.isNaN(minCredits)) filter.credits.$gte = minCredits;
    if (!Number.isNaN(maxCredits)) filter.credits.$lte = maxCredits;
  }

  const minCapacity = Number(query.minCapacity);
  const maxCapacity = Number(query.maxCapacity);
  if (!Number.isNaN(minCapacity) || !Number.isNaN(maxCapacity)) {
    filter.capacity = {};
    if (!Number.isNaN(minCapacity)) filter.capacity.$gte = minCapacity;
    if (!Number.isNaN(maxCapacity)) filter.capacity.$lte = maxCapacity;
  }

  if (query.enrolled !== undefined) {
    const enrolled = Number(query.enrolled);
    if (!Number.isNaN(enrolled)) filter.enrolled = enrolled;
  }

  return filter;
}

function validateCreateBody(body) {
  const errors = [];

  // required (по твоей форме)
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const credits = Number(body.credits);
  const capacity = Number(body.capacity);
  const enrolled = body.enrolled === undefined ? 0 : Number(body.enrolled);

  if (!title) errors.push("title is required");
  if (!code) errors.push("code is required");
  if (!description) errors.push("description is required");

  if (Number.isNaN(credits) || credits <= 0)
    errors.push("credits must be a positive number");
  if (Number.isNaN(capacity) || capacity <= 0)
    errors.push("capacity must be a positive number");
  if (Number.isNaN(enrolled) || enrolled < 0)
    errors.push("enrolled must be a non-negative number");

  if (
    !Number.isNaN(enrolled) &&
    !Number.isNaN(capacity) &&
    enrolled > capacity
  ) {
    errors.push("enrolled cannot be greater than capacity");
  }

  // optional (из твоих данных)
  const type = typeof body.type === "string" ? body.type.trim() : "course";
  const instructor =
    typeof body.instructor === "string" ? body.instructor.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const schedule =
    typeof body.schedule === "string" ? body.schedule.trim() : "";
  const room = typeof body.room === "string" ? body.room.trim() : "";
  const prerequisites =
    typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";

  // мягкая валидация email, только если передали
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("email must be a valid email");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    doc: {
      type, // "course"
      title,
      code,
      credits,
      capacity,
      description,
      enrolled,
      instructor,
      email,
      schedule,
      room,
      prerequisites,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

function validateUpdateBody(body) {
  // PUT: частичный апдейт
  const update = {};
  const errors = [];

  if (body.type !== undefined) {
    const v = typeof body.type === "string" ? body.type.trim() : "";
    if (!v) errors.push("type cannot be empty");
    else update.type = v;
  }

  if (body.title !== undefined) {
    const v = typeof body.title === "string" ? body.title.trim() : "";
    if (!v) errors.push("title cannot be empty");
    else update.title = v;
  }

  if (body.code !== undefined) {
    const v = typeof body.code === "string" ? body.code.trim() : "";
    if (!v) errors.push("code cannot be empty");
    else update.code = v;
  }

  if (body.description !== undefined) {
    const v =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!v) errors.push("description cannot be empty");
    else update.description = v;
  }

  if (body.credits !== undefined) {
    const v = Number(body.credits);
    if (Number.isNaN(v) || v <= 0)
      errors.push("credits must be a positive number");
    else update.credits = v;
  }

  if (body.capacity !== undefined) {
    const v = Number(body.capacity);
    if (Number.isNaN(v) || v <= 0)
      errors.push("capacity must be a positive number");
    else update.capacity = v;
  }

  if (body.enrolled !== undefined) {
    const v = Number(body.enrolled);
    if (Number.isNaN(v) || v < 0)
      errors.push("enrolled must be a non-negative number");
    else update.enrolled = v;
  }

  if (body.instructor !== undefined) {
    const v = typeof body.instructor === "string" ? body.instructor.trim() : "";
    if (!v) errors.push("instructor cannot be empty");
    else update.instructor = v;
  }

  if (body.email !== undefined) {
    const v = typeof body.email === "string" ? body.email.trim() : "";
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      errors.push("email must be a valid email");
    } else {
      update.email = v;
    }
  }

  if (body.schedule !== undefined) {
    const v = typeof body.schedule === "string" ? body.schedule.trim() : "";
    if (!v) errors.push("schedule cannot be empty");
    else update.schedule = v;
  }

  if (body.room !== undefined) {
    const v = typeof body.room === "string" ? body.room.trim() : "";
    if (!v) errors.push("room cannot be empty");
    else update.room = v;
  }

  if (body.prerequisites !== undefined) {
    const v =
      typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";
    if (!v) errors.push("prerequisites cannot be empty");
    else update.prerequisites = v;
  }

  if (errors.length > 0) return { ok: false, errors };
  if (Object.keys(update).length === 0) {
    return {
      ok: false,
      errors: ["at least one field must be provided for update"],
    };
  }

  update.updatedAt = new Date();
  return { ok: true, update };
}

// ---------- routes ----------

// GET /api/course (and /api/courses): list with filter/sort/projection
router.get("/", async (req, res) => {
  try {
    const col = await getCollection(COLLECTION);

    const filter = buildFilter(req.query);
    const sort = parseSort(req.query.sort);
    const projection = parseFields(req.query.fields);

    let cursor = col.find(filter);
    if (sort) cursor = cursor.sort(sort);
    if (projection) cursor = cursor.project(projection);

    const docs = await cursor.toArray();
    res.status(200).json(docs.map(toPublic));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/course/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid id" });

    const col = await getCollection(COLLECTION);
    const doc = await col.findOne({ _id: new ObjectId(id) });

    if (!doc) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(toPublic(doc));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/course
router.post("/", async (req, res) => {
  try {
    const parsed = validateCreateBody(req.body);
    if (!parsed.ok) {
      return res
        .status(400)
        .json({ error: "Bad Request", details: parsed.errors });
    }

    const col = await getCollection(COLLECTION);
    const result = await col.insertOne(parsed.doc);

    const created = await col.findOne({ _id: result.insertedId });
    res.status(201).json(toPublic(created));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/course/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid id" });

    const parsed = validateUpdateBody(req.body);
    if (!parsed.ok) {
      return res
        .status(400)
        .json({ error: "Bad Request", details: parsed.errors });
    }

    const col = await getCollection(COLLECTION);

    // enforce enrolled <= capacity (using existing if not provided)
    if (
      parsed.update.enrolled !== undefined ||
      parsed.update.capacity !== undefined
    ) {
      const existing = await col.findOne(
        { _id: new ObjectId(id) },
        { projection: { capacity: 1, enrolled: 1 } },
      );
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

    const result = await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: parsed.update },
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not Found" });

    const updated = await col.findOne({ _id: new ObjectId(id) });
    res.status(200).json(toPublic(updated));
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/course/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid id" });

    const col = await getCollection(COLLECTION);
    const result = await col.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Not Found" });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
