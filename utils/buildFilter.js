/**
 * Build MongoDB filter from query parameters
 * @param {Object} query - Express request query object
 * @returns {Object} MongoDB filter object
 */
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

module.exports = { buildFilter };
