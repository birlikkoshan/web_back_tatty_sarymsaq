const { isValidEmail } = require("./isValidEmail");

/**
 * Validate course update body
 * @param {Object} body - Request body
 * @returns {Object} Validation result with ok flag, errors array, and update object if valid
 */
function validateUpdateBody(body) {
  const update = {};
  const errors = [];

  if (body.type !== undefined) {
    const v = typeof body.type === "string" ? body.type.trim() : "";
    if (!v) errors.push("type cannot be empty");
    else update.type = v;
  }

  if (body.title !== undefined) {
    const v = typeof body.title === "string" ? body.title.trim() : "";
    if (!v) errors.push("title cannot be empty");
    else update.title = v;
  }

  if (body.code !== undefined) {
    const v = typeof body.code === "string" ? body.code.trim() : "";
    if (!v) errors.push("code cannot be empty");
    else update.code = v;
  }

  if (body.description !== undefined) {
    const v =
      typeof body.description === "string" ? body.description.trim() : "";
    if (!v) errors.push("description cannot be empty");
    else update.description = v;
  }

  if (body.credits !== undefined) {
    const v = Number(body.credits);
    if (Number.isNaN(v) || v <= 0)
      errors.push("credits must be a positive number");
    else update.credits = v;
  }

  if (body.capacity !== undefined) {
    const v = Number(body.capacity);
    if (Number.isNaN(v) || v <= 0)
      errors.push("capacity must be a positive number");
    else update.capacity = v;
  }

  if (body.enrolled !== undefined) {
    const v = Number(body.enrolled);
    if (Number.isNaN(v) || v < 0)
      errors.push("enrolled must be a non-negative number");
    else update.enrolled = v;
  }

  if (body.instructor !== undefined) {
    const v = typeof body.instructor === "string" ? body.instructor.trim() : "";
    update.instructor = v;
  }

  if (body.email !== undefined) {
    const v = typeof body.email === "string" ? body.email.trim() : "";
    if (v && !isValidEmail(v)) {
      errors.push("email must be a valid email");
    } else {
      update.email = v;
    }
  }

  if (body.schedule !== undefined) {
    const v = typeof body.schedule === "string" ? body.schedule.trim() : "";
    update.schedule = v;
  }

  if (body.room !== undefined) {
    const v = typeof body.room === "string" ? body.room.trim() : "";
    update.room = v;
  }

  if (body.prerequisites !== undefined) {
    const v =
      typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";
    update.prerequisites = v;
  }

  if (body.department !== undefined) {
    const v =
      typeof body.department === "string" ? body.department.trim() : "";
    update.department = v;
  }

  if (errors.length > 0) return { ok: false, errors };
  if (Object.keys(update).length === 0) {
    return {
      ok: false,
      errors: ["at least one field must be provided for update"],
    };
  }

  update.updatedAt = new Date();
  return { ok: true, update };
}

module.exports = { validateUpdateBody };
