/**
 * Parse fields parameter for projection
 * @param {string} fieldsRaw - Comma-separated field names
 * @returns {Object|null} MongoDB projection object or null
 */
function parseFields(fieldsRaw) {
  if (!fieldsRaw || typeof fieldsRaw !== "string") return null;

  const parts = fieldsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const projection = {};
  for (const f of parts) projection[f] = 1;

  projection._id = 1;
  return projection;
}

module.exports = { parseFields };
