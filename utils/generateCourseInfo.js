const { escapeHtml } = require("./escapeHtml");

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

module.exports = { generateCourseInfo };
