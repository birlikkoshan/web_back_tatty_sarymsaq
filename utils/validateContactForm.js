const { isValidEmail } = require("./isValidEmail");

/**
 * Validate contact form data
 * @param {Object} data - Form data object
 * @returns {Array} Array of validation error messages
 */
function validateContactForm(data) {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required");
  }
  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required");
  }
  if (!data.message || data.message.trim() === "") {
    errors.push("Message is required");
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email format is invalid");
  }

  return errors;
}

module.exports = { validateContactForm };
