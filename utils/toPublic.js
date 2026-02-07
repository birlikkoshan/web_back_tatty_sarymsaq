/**
 * Convert MongoDB document to public format (replace _id with id)
 * @param {Object} doc - MongoDB document
 * @returns {Object} Document with id instead of _id; studentIds as string[] if present
 */
function toPublic(doc) {
  if (!doc) return doc;
  const { _id, studentIds, instructorId, ...rest } = doc;
  const out = { id: String(_id), ...rest };
  if (Array.isArray(studentIds)) {
    out.studentIds = studentIds.map((i) => (i != null ? String(i) : i));
  }
  if (instructorId != null) {
    out.instructorId = String(instructorId);
  }
  return out;
}

module.exports = { toPublic };
