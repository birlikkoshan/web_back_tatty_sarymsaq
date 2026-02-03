const { getCollection } = require("../config/database");

const COLLECTION_NAME = "users";

async function getUsersCollection() {
  return getCollection(COLLECTION_NAME);
}

async function findUserByEmail(email) {
  const col = await getUsersCollection();
  return col.findOne({ email });
}

async function insertUser(doc) {
  const col = await getUsersCollection();
  const result = await col.insertOne(doc);
  return col.findOne({ _id: result.insertedId });
}

module.exports = {
  findUserByEmail,
  insertUser,
};
