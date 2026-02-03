/**
 * Convert MongoDB document to public format (replace _id with id)
 * @param {Object} doc - MongoDB document
 * @returns {Object} Document with id instead of _id
 */
function toPublic(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

module.exports = { toPublic };
