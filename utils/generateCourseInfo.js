const { escapeHtml } = require("./escapeHtml");

/**
 * Generate course info HTML for enrollment page
 * @param {Object} item - Course data
 * @param {Object} stats - Course statistics from calculateStats
 * @returns {string} HTML string
 */
function generateCourseInfo(item, stats) {
  return `
    <div class="course-detail-header" data-course-id="${escapeHtml(item.id || "")}">
      <div class="editable-row">
        <h1 id="field-title">${escapeHtml(item.title || "N/A")}</h1>
        <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('title', 'text')">Edit</button>
      </div>
      <div class="editable-row">
        <span class="course-code-badge" id="field-code">${escapeHtml(item.code || "N/A")}</span>
        <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('code', 'text')">Edit</button>
      </div>
    </div>

    <div class="course-detail-body">
      <div class="course-section">
        <h2>Course Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Credits</strong>
            <p id="field-credits">${escapeHtml(item.credits || "N/A")}</p>
            <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('credits', 'number')">Edit</button>
          </div>
          <div class="info-item">
            <strong>Enrolled</strong>
            <p id="field-enrolled">${item.enrolled || 0}</p>
            <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('enrolled', 'number')">Edit</button>
          </div>
          <div class="info-item">
            <strong>Capacity</strong>
            <p id="field-capacity">${item.capacity || 0}</p>
            <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('capacity', 'number')">Edit</button>
          </div>
        </div>
      </div>

      <div class="course-section">
        <div class="section-header-inline">
          <h2>Description</h2>
          <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('description', 'textarea')">Edit</button>
        </div>
        <p id="field-description">${escapeHtml(item.description || "No description available")}</p>
      </div>

      <div class="course-section">
        <h2>Instructor</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Name</strong>
            <p id="field-instructor">${escapeHtml(item.instructor || "N/A")}</p>
          </div>
          <div class="info-item">
            <strong>Email</strong>
            <p><a id="field-email-link" href="mailto:${escapeHtml(item.email || "")}"><span id="field-email">${escapeHtml(item.email || "N/A")}</span></a></p>
          </div>
        </div>
        <div class="admin-only instructor-selector">
          <label for="instructorSelect"><strong>Choose instructor</strong></label>
          <div class="instructor-controls">
            <select id="instructorSelect">
              <option value="">Select instructor...</option>
            </select>
            <input id="instructorEmailPreview" type="email" readonly placeholder="Email will be filled automatically" />
            <button class="btn btn-primary" type="button" onclick="saveInstructorSelection()">Save Instructor</button>
          </div>
        </div>
      </div>

      <div class="course-section">
        <h2>Schedule & Location</h2>
        <div class="info-grid">
          <div class="info-item">
            <strong>Times</strong>
            <p id="field-schedule">${escapeHtml(item.schedule || "N/A")}</p>
            <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('schedule', 'text')">Edit</button>
          </div>
          <div class="info-item">
            <strong>Room</strong>
            <p id="field-room">${escapeHtml(item.room || "N/A")}</p>
            <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('room', 'text')">Edit</button>
          </div>
        </div>
      </div>

      <div class="course-section">
        <div class="section-header-inline">
          <h2>Prerequisites</h2>
          <button class="btn btn-secondary admin-only edit-btn" type="button" onclick="editCourseField('prerequisites', 'text')">Edit</button>
        </div>
        <p id="field-prerequisites">${escapeHtml(item.prerequisites || "None")}</p>
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
      <button id="coursePrimaryAction" class="btn btn-primary" onclick="enrollCourse('${item.id}')">Enroll Now</button>
      <div class="instructor-only add-student-panel">
        <input id="studentIdInput" type="text" placeholder="Enter studentId" />
        <button class="btn btn-primary" type="button" onclick="addStudentById('${item.id}')">Add</button>
      </div>
      <a href="/courses" class="btn btn-secondary">Back to Courses</a>
    </div>
  `;
}

module.exports = { generateCourseInfo };
