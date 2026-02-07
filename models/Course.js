const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

const COLLECTION_NAME = "courses";

async function getCourseCollection() {
  return getCollection(COLLECTION_NAME);
}

async function findCourses(filter = {}, sort = null, projection = null) {
  const col = await getCourseCollection();
  let cursor = col.find(filter);
  if (sort) cursor = cursor.sort(sort);
  if (projection) cursor = cursor.project(projection);
  return cursor.toArray();
}

async function countCourses(filter = {}) {
  const col = await getCourseCollection();
  return col.countDocuments(filter);
}

async function findCoursesPaginated(
  filter = {},
  sort = null,
  projection = null,
  skip = 0,
  limit = 10,
) {
  const col = await getCourseCollection();
  let cursor = col.find(filter);
  if (sort) cursor = cursor.sort(sort);
  if (projection) cursor = cursor.project(projection);
  cursor = cursor.skip(skip).limit(limit);
  return cursor.toArray();
}

async function findCourseById(id) {
  const col = await getCourseCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

async function findCourseByIdProjection(id, projection) {
  const col = await getCourseCollection();
  return col.findOne({ _id: new ObjectId(id) }, { projection });
}

async function insertCourse(doc) {
  const col = await getCourseCollection();
  const result = await col.insertOne(doc);
  return col.findOne({ _id: result.insertedId });
}

async function updateCourse(id, update) {
  const col = await getCourseCollection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: update },
  );
  if (result.matchedCount === 0) return null;
  return col.findOne({ _id: new ObjectId(id) });
}

async function deleteCourse(id) {
  const col = await getCourseCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

async function incrementEnrollment(id) {
  const col = await getCourseCollection();
  const result = await col.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      $expr: { $lt: ["$enrolled", "$capacity"] },
    },
    { $inc: { enrolled: 1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result.value || null;
}

async function decrementEnrollment(id) {
  const col = await getCourseCollection();
  const result = await col.findOneAndUpdate(
    {
      _id: new ObjectId(id),
      enrolled: { $gt: 0 },
    },
    { $inc: { enrolled: -1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  return result.value || null;
}

module.exports = {
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
};
