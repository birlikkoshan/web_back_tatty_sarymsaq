const { ObjectId } = require("mongodb");

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

module.exports = { isValidObjectId };
