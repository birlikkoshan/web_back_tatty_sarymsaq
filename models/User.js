const { ObjectId } = require("mongodb");
const { getCollection } = require("../config/database");

const COLLECTION_NAME = "users";

async function getUsersCollection() {
  return getCollection(COLLECTION_NAME);
}

async function findUserByEmail(email) {
  const col = await getUsersCollection();
  return col.findOne({ email });
}

async function findUserById(id) {
  const col = await getUsersCollection();
  return col.findOne({ _id: new ObjectId(id) });
}

async function insertUser(doc) {
  const col = await getUsersCollection();
  const result = await col.insertOne(doc);
  return col.findOne({ _id: result.insertedId });
}

async function findUsersByRole(role, projection = null) {
  const col = await getUsersCollection();
  let cursor = col.find({ role });
  if (projection) cursor = cursor.project(projection);
  return cursor.toArray();
}

async function findUsersByIds(ids, projection = null) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const col = await getUsersCollection();
  const objectIds = ids
    .filter((id) => id != null)
    .map((id) => (typeof id === "string" ? new ObjectId(id) : id));
  if (objectIds.length === 0) return [];
  let cursor = col.find({ _id: { $in: objectIds } });
  if (projection) cursor = cursor.project(projection);
  return cursor.toArray();
}

module.exports = {
  findUserById,
  findUserByEmail,
  insertUser,
  findUsersByRole,
  findUsersByIds,
};
