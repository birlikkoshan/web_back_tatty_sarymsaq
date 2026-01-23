// ========== ACCORDION FUNCTIONALITY ==========
const filterAccordion = document.getElementById('filterAccordion');
const filterContent = document.getElementById('filterContent');
const accordionToggle = filterAccordion.querySelector('.accordion-toggle');

filterAccordion.addEventListener('click', () => {
  filterAccordion.classList.toggle('active');
  filterContent.classList.toggle('active');
  accordionToggle.classList.toggle('active');
});

// ========== FILTER, SORT & PROJECTION FUNCTIONALITY ==========
const applyFiltersBtn = document.getElementById('applyFiltersBtn');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const coursesContainer = document.getElementById('courses');

applyFiltersBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  await loadFilteredCourses();
});

clearFiltersBtn.addEventListener('click', () => {
  document.getElementById('filterForm').reset();
  document.getElementById('fieldsProjection').value = 'title,code,credits,instructor,schedule,room,capacity,enrolled';
  loadInitialCourses();
});

// Allow Enter key to trigger filter
document.getElementById('filterForm').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    applyFiltersBtn.click();
  }
});

async function loadFilteredCourses() {
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

    coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Loading courses...</p>';

    const response = await fetch(url);
    const courses = await response.json();

    if (!response.ok) {
      coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
      return;
    }

    if (courses.length === 0) {
      coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No courses found</p>';
      return;
    }

    // Render filtered courses
    renderCourses(courses);
  } catch (error) {
    console.error('Error:', error);
    coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
  }
}

async function loadInitialCourses() {
  try {
    const response = await fetch('/api/courses');
    const courses = await response.json();

    if (!response.ok) {
      coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
      return;
    }

    if (courses.length === 0) {
      coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No courses found</p>';
      return;
    }

    renderCourses(courses);
  } catch (error) {
    console.error('Error:', error);
    coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
  }
}

function renderCourses(courses) {
  coursesContainer.innerHTML = courses.map(course => {
    const pct = Math.round((course.enrolled / course.capacity) * 100) || 0;
    return `
      <div class="course-card">
        <div class="course-card-header">
          <h2>${course.title || 'N/A'}</h2>
          <span class="course-code">${course.code || 'N/A'}</span>
        </div>
        <div class="course-card-body">
          <p class="course-description">${course.description || 'No description'}</p>
          <div class="course-meta">
            ${course.credits !== undefined ? `<div class="course-meta-item"><strong>${course.credits}</strong><small>Credits</small></div>` : ''}
            ${course.instructor ? `<div class="course-meta-item"><strong>${course.instructor}</strong><small>Instructor</small></div>` : ''}
          </div>
          <div class="course-meta">
            ${course.schedule ? `<div class="course-meta-item"><strong>${course.schedule}</strong><small>Times</small></div>` : ''}
            ${course.room ? `<div class="course-meta-item"><strong>${course.room}</strong><small>Location</small></div>` : ''}
          </div>
          ${course.capacity !== undefined ? `
          <div class="enrollment-status"><strong>${course.enrolled || 0}/${course.capacity}</strong> Students Enrolled
            <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%;"></div></div>
          </div>
          ` : ''}
        </div>
        <div class="course-card-footer">
          <a class="btn btn-primary" href="/courses/${course.id}">View & Enroll</a>
          <button class="btn btn-delete" onclick="deleteCourse('${course.id}')">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// ========== MODAL FUNCTIONALITY ==========
const modal = document.getElementById('courseModal');
const addCourseBtn = document.getElementById('addCourseBtn');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const courseForm = document.getElementById('courseForm');
const alertMessage = document.getElementById('alertMessage');

// Open modal
addCourseBtn.addEventListener('click', () => {
  modal.classList.add('show');
  courseForm.reset();
  alertMessage.classList.remove('show');
});

// Close modal  
const closeModalWindow = () => {
  modal.classList.remove('show');
  alertMessage.classList.remove('show');
};

closeModal.addEventListener('click', closeModalWindow);
cancelBtn.addEventListener('click', closeModalWindow);

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModalWindow();
  }
});

// Handle form submission
courseForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    code: document.getElementById('code').value,
    credits: document.getElementById('credits').value,
    capacity: document.getElementById('capacity').value,
    description: document.getElementById('description').value,
    enrolled: document.getElementById('enrolled').value
  };

  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Course added successfully!', 'success');
      setTimeout(() => {
        closeModalWindow();
        location.reload();
      }, 1500);
    } else {
      showAlert(data.error || 'Error adding course', 'error');
    }
  } catch (error) {
    showAlert('Error adding course: ' + error.message, 'error');
  }
});

function showAlert(message, type) {
  alertMessage.textContent = message;
  alertMessage.className = `alert show alert-${type}`;
}

// Delete course function (defined once)
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
        loadInitialCourses();
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

// Load courses when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadInitialCourses();
});
