// Course Filter and Search Handler
document.addEventListener('DOMContentLoaded', () => {
  const filterForm = document.getElementById('filterForm');
  const coursesContainer = document.getElementById('courses');
  const searchBtn = document.getElementById('searchBtn');
  const clearBtn = document.getElementById('clearBtn');

  loadCourses();

  searchBtn.addEventListener('click', async () => {
    await loadCourses();
  });

  clearBtn.addEventListener('click', () => {
    filterForm.reset();
    loadCourses();
  });

  // Allow Enter key to trigger search
  filterForm.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      loadCourses();
    }
  });

  async function loadCourses() {
    try {
      const queryParams = new URLSearchParams();

      const searchTitle = document.getElementById('searchTitle').value.trim();
      const searchCode = document.getElementById('searchCode').value.trim();
      const searchInstructor = document.getElementById('searchInstructor').value.trim();
      const filterType = document.getElementById('filterType').value.trim();
      const minCredits = document.getElementById('minCredits').value.trim();
      const maxCredits = document.getElementById('maxCredits').value.trim();
      const minCapacity = document.getElementById('minCapacity').value.trim();
      const maxCapacity = document.getElementById('maxCapacity').value.trim();
      const filterEnrolled = document.getElementById('filterEnrolled').value.trim();
      const sortField = document.getElementById('sortField').value.trim();
      const sortDirection = document.getElementById('sortDirection').value.trim();
      const fieldsProjection = document.getElementById('fieldsProjection').value.trim();

      if (searchTitle) queryParams.append('title', searchTitle);
      if (searchCode) queryParams.append('code', searchCode);
      if (searchInstructor) queryParams.append('instructor', searchInstructor);
      if (filterType) queryParams.append('type', filterType);
      if (minCredits) queryParams.append('minCredits', minCredits);
      if (maxCredits) queryParams.append('maxCredits', maxCredits);
      if (minCapacity) queryParams.append('minCapacity', minCapacity);
      if (maxCapacity) queryParams.append('maxCapacity', maxCapacity);
      if (filterEnrolled) queryParams.append('enrolled', filterEnrolled);
      if (sortField) {
        const sortValue = sortDirection === '-' ? '-' + sortField : sortField;
        queryParams.append('sort', sortValue);
      }
      if (fieldsProjection) queryParams.append('fields', fieldsProjection);

      const queryString = queryParams.toString();
      const url = `/api/courses${queryString ? '?' + queryString : ''}`;

      coursesContainer.innerHTML = '<p style="text-align: center; color: #666;">Loading courses...</p>';

      const response = await fetch(url);
      const courses = await response.json();

      if (!response.ok) {
        coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f;">Error loading courses</p>';
        return;
      }

      if (courses.length === 0) {
        coursesContainer.innerHTML = '<p style="text-align: center; color: #666;">No courses found</p>';
        return;
      }

      // Render courses
      coursesContainer.innerHTML = courses.map(course => `
        <div class="course-card">
          <div class="course-header">
            <h3>${course.title || 'N/A'}</h3>
            <span class="course-code">${course.code || 'N/A'}</span>
          </div>
          ${course.description ? `<p class="course-description">${course.description}</p>` : ''}
          <div class="course-details">
            ${course.type ? `<span><strong>Type:</strong> ${course.type}</span>` : ''}
            ${course.credits !== undefined ? `<span><strong>Credits:</strong> ${course.credits}</span>` : ''}
            ${course.instructor ? `<span><strong>Instructor:</strong> ${course.instructor}</span>` : ''}
            ${course.email ? `<span><strong>Email:</strong> ${course.email}</span>` : ''}
            ${course.schedule ? `<span><strong>Schedule:</strong> ${course.schedule}</span>` : ''}
            ${course.room ? `<span><strong>Room:</strong> ${course.room}</span>` : ''}
            ${course.capacity !== undefined ? `<span><strong>Capacity:</strong> ${course.capacity}</span>` : ''}
            ${course.enrolled !== undefined ? `<span><strong>Enrolled:</strong> ${course.enrolled}</span>` : ''}
            ${course.prerequisites ? `<span><strong>Prerequisites:</strong> ${course.prerequisites}</span>` : ''}
          </div>
          <div class="course-actions">
            <button class="btn btn-secondary" onclick="editCourse('${course.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteCourse('${course.id}')">Delete</button>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading courses:', error);
      coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f;">Error loading courses</p>';
    }
  }

  window.editCourse = function(courseId) {
    alert('Edit functionality to be implemented for course: ' + courseId);
  };

  window.deleteCourse = function(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
      fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          alert('Course deleted successfully!');
          loadCourses();
        } else {
          alert('Error deleting course');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error deleting course: ' + error.message);
      });
    }
  };
});
