const express = require("express");
const { ObjectId } = require("mongodb");
const { getCollection } = require("../database/mongo");
const { requireAuth } = require("../middleware/requireAuth");
const {
  isValidObjectId,
  toPublic,
  parseSort,
  parseFields,
  buildFilter,
  validateCreateBody,
  validateUpdateBody,
} = require("../utils");

const router = express.Router();
const COLLECTION = "courses";

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
    console.error("Error in GET /api/courses:", err);
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
    console.error("Error in GET /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/course
router.post("/", requireAuth, async (req, res) => {
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
    console.error("Error in POST /api/courses:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /api/course/:id
router.put("/:id", requireAuth, async (req, res) => {
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
    console.error("Error in PUT /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /api/course/:id
router.delete("/:id", requireAuth, async (req, res) => {
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
    console.error("Error in DELETE /api/courses/:id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
