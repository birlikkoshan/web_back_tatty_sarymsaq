const { isValidEmail } = require("./isValidEmail");

/**
 * Validate course creation body
 * @param {Object} body - Request body
 * @returns {Object} Validation result with ok flag, errors array, and doc if valid
 */
function validateCreateBody(body) {
  const errors = [];

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const credits = Number(body.credits);
  const capacity = Number(body.capacity);
  const enrolled = body.enrolled === undefined ? 0 : Number(body.enrolled);

  if (!title) errors.push("title is required");
  if (!code) errors.push("code is required");

  if (Number.isNaN(credits) || credits <= 0)
    errors.push("credits must be a positive number");
  if (Number.isNaN(capacity) || capacity <= 0)
    errors.push("capacity must be a positive number");
  if (Number.isNaN(enrolled) || enrolled < 0)
    errors.push("enrolled must be a non-negative number");

  if (
    !Number.isNaN(enrolled) &&
    !Number.isNaN(capacity) &&
    enrolled > capacity
  ) {
    errors.push("enrolled cannot be greater than capacity");
  }

  const type = typeof body.type === "string" ? body.type.trim() : "course";
  const instructor =
    typeof body.instructor === "string" ? body.instructor.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const schedule =
    typeof body.schedule === "string" ? body.schedule.trim() : "";
  const room = typeof body.room === "string" ? body.room.trim() : "";
  const prerequisites =
    typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";

  if (email && !isValidEmail(email)) {
    errors.push("email must be a valid email");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    doc: {
      type,
      title,
      code,
      credits,
      capacity,
      description,
      enrolled,
      instructor,
      email,
      schedule,
      room,
      prerequisites,
      department,
      studentIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

module.exports = { validateCreateBody };
