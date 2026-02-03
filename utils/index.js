const { escapeHtml } = require("./escapeHtml");
const { calculateStats } = require("./calculateStats");
const { generateCourseInfo } = require("./generateCourseInfo");
const { isValidObjectId } = require("./isValidObjectId");
const { toPublic } = require("./toPublic");
const { parseSort } = require("./parseSort");
const { parseFields } = require("./parseFields");
const { buildFilter } = require("./buildFilter");
const { isValidEmail } = require("./isValidEmail");
const { validateCreateBody } = require("./validateCreateBody");
const { validateUpdateBody } = require("./validateUpdateBody");
const { validateContactForm } = require("./validateContactForm");

module.exports = {
  escapeHtml,
  calculateStats,
  generateCourseInfo,
  isValidObjectId,
  toPublic,
  parseSort,
  parseFields,
  buildFilter,
  isValidEmail,
  validateCreateBody,
  validateUpdateBody,
  validateContactForm,
};
