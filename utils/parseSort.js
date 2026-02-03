/**
 * Parse sort parameter from query string
 * @param {string} sortRaw - Raw sort string (e.g., "-title" or "title")
 * @returns {Object|null} MongoDB sort object or null
 */
function parseSort(sortRaw) {
  if (!sortRaw || typeof sortRaw !== "string") return null;

  const field = sortRaw.startsWith("-") ? sortRaw.slice(1) : sortRaw;
  if (!field) return null;

  const dir = sortRaw.startsWith("-") ? -1 : 1;
  return { [field]: dir };
}

module.exports = { parseSort };
