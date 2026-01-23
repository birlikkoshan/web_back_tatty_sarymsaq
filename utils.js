const { ObjectId } = require("mongodb");

//todo:delte this comment

// ========== HTML Utilities ==========

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (text == null) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}


/**
 * Calculate course enrollment statistics
 * @param {Object} item - Course item with enrolled and capacity
 * @returns {Object} Object with percentage and spotsRemaining
 */
function calculateStats(item) {
  if (!item || !item.capacity) return { percentage: 0, spotsRemaining: 0 };
  const percentage = Math.round((item.enrolled / item.capacity) * 100) || 0;
  const spotsRemaining = Math.max(0, item.capacity - item.enrolled);
  return { percentage, spotsRemaining };
}

/**
 * Generate course info HTML for enrollment page
 * @param {Object} item - Course data
 * @param {Object} stats - Course statistics from calculateStats
 * @returns {string} HTML string
 */
function generateCourseInfo(item, stats) {
  return `
    <div class="course-detail-header">
      <h1>${escapeHtml(item.title || "N/A")}</h1>
      <span class="course-code-badge">${escapeHtml(item.code || "N/A")}</span>
    </div>

    <div class="course-detail-body">
      <div class="course-section">
        <h2>Course Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Credits</strong>
            <p>${escapeHtml(item.credits || "N/A")}</p>
          </div>
          <div class="info-item">
            <strong>Enrolled</strong>
            <p>${item.enrolled || 0}/${item.capacity || 0}</p>
          </div>
          <div class="info-item">
            <strong>Capacity</strong>
            <p>${stats.percentage}%</p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Description</h2>
        <p>${escapeHtml(item.description || "No description available")}</p>
      </div>

      <div class="course-section">
        <h2>Instructor</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Name</strong>
            <p>${escapeHtml(item.instructor || "N/A")}</p>
          </div>
          <div class="info-item">
            <strong>Email</strong>
            <p><a href="mailto:${escapeHtml(item.email || "")}">${escapeHtml(item.email || "N/A")}</a></p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Schedule & Location</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Times</strong>
            <p>${escapeHtml(item.schedule || "N/A")}</p>
          </div>
          <div class="info-item">
            <strong>Room</strong>
            <p>${escapeHtml(item.room || "N/A")}</p>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Enrollment Status</h2>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.percentage}%;"></div>
        </div>
        <p>${stats.spotsRemaining} spots remaining</p>
      </div>
    </div>

    <div class="course-detail-footer">
      <button class="btn btn-primary" onclick="enrollCourse('${item.id}', ${item.capacity || 0}, ${item.enrolled || 0})">Enroll Now</button>
      <a href="/courses" class="btn btn-secondary">Back to Courses</a>
    </div>
  `;
}

// ========== MongoDB Utilities ==========

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid ObjectId
 */
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

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

// ========== Query Utilities ==========

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

/**
 * Parse fields parameter for projection
 * @param {string} fieldsRaw - Comma-separated field names
 * @returns {Object|null} MongoDB projection object or null
 */
function parseFields(fieldsRaw) {
  // fields=title,credits,code => projection
  if (!fieldsRaw || typeof fieldsRaw !== "string") return null;

  const parts = fieldsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const projection = {};
  for (const f of parts) projection[f] = 1;

  // keep _id so we can output id
  projection._id = 1;
  return projection;
}

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

// ========== Validation Utilities ==========

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate course creation body
 * @param {Object} body - Request body
 * @returns {Object} Validation result with ok flag, errors array, and doc if valid
 */
function validateCreateBody(body) {
  const errors = [];

  // Required fields
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const credits = Number(body.credits);
  const capacity = Number(body.capacity);
  const enrolled = body.enrolled === undefined ? 0 : Number(body.enrolled);

  if (!title) errors.push("title is required");
  if (!code) errors.push("code is required");
  if (!description) errors.push("description is required");

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

  // Optional fields
  const type = typeof body.type === "string" ? body.type.trim() : "course";
  const instructor =
    typeof body.instructor === "string" ? body.instructor.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const schedule =
    typeof body.schedule === "string" ? body.schedule.trim() : "";
  const room = typeof body.room === "string" ? body.room.trim() : "";
  const prerequisites =
    typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";

  // Email validation (only if provided)
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
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

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
    // Instructor can be empty, so we just set it
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
    // Schedule is optional, so we just set it
    update.schedule = v;
  }

  if (body.room !== undefined) {
    const v = typeof body.room === "string" ? body.room.trim() : "";
    // Room is optional, so we just set it
    update.room = v;
  }

  if (body.prerequisites !== undefined) {
    const v =
      typeof body.prerequisites === "string" ? body.prerequisites.trim() : "";
    // Prerequisites is optional, so we just set it
    update.prerequisites = v;
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

  // Basic email format validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push("Email format is invalid");
  }

  return errors;
}

module.exports = {
  // HTML Utilities
  escapeHtml,
  
  // Course Utilities
  calculateStats,
  generateCourseInfo,
  
  // MongoDB Utilities
  isValidObjectId,
  toPublic,
  
  // Query Utilities
  parseSort,
  parseFields,
  buildFilter,
  
  // Validation Utilities
  isValidEmail,
  validateCreateBody,
  validateUpdateBody,
  validateContactForm,
};
