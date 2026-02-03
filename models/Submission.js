const { getCollection } = require("../config/database");

const COLLECTION_NAME = "submissions";

async function getSubmissionsCollection() {
  return getCollection(COLLECTION_NAME);
}

async function insertSubmission(doc) {
  const col = await getSubmissionsCollection();
  const result = await col.insertOne(doc);
  return result;
}

module.exports = {
  insertSubmission,
};
