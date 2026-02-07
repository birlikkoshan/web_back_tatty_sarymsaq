// Run only when DOM is ready so elements exist
document.addEventListener('DOMContentLoaded', () => {
  const coursesContainer = document.getElementById('courses');
  if (!coursesContainer) return; // Not on courses page
  const showDeleteButton = coursesContainer.dataset.showDelete !== 'false';
  const showDropButton = coursesContainer.dataset.showDrop === 'true';
  const viewActionLabel = coursesContainer.dataset.viewLabel || 'View & Enroll';
  const pageSize = Number(coursesContainer.dataset.pageSize) > 0 ? Number(coursesContainer.dataset.pageSize) : 6;
  let currentPage = 1;
  let totalPages = 1;
  let currentMode = 'initial';
  let paginationEl = document.getElementById('coursesPagination');
  if (!paginationEl) {
    paginationEl = document.createElement('div');
    paginationEl.id = 'coursesPagination';
    paginationEl.className = 'courses-pagination';
    coursesContainer.insertAdjacentElement('afterend', paginationEl);
  }

  // ========== ACCORDION ==========
  const filterAccordion = document.getElementById('filterAccordion');
  const filterContent = document.getElementById('filterContent');
  const accordionToggle = filterAccordion?.querySelector('.accordion-toggle');
  if (filterAccordion && filterContent && accordionToggle) {
    filterAccordion.addEventListener('click', () => {
      filterAccordion.classList.toggle('active');
      filterContent.classList.toggle('active');
      accordionToggle.classList.toggle('active');
    });
  }

  // ========== FILTER / SORT ==========
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const filterForm = document.getElementById('filterForm');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      currentMode = 'filtered';
      currentPage = 1;
      await loadFilteredCourses();
    });
  }
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      if (filterForm) filterForm.reset();
      const fieldsEl = document.getElementById('fieldsProjection');
      if (fieldsEl) fieldsEl.value = 'title,code,credits,instructor,schedule,room,capacity,enrolled';
      currentMode = 'initial';
      currentPage = 1;
      loadInitialCourses();
    });
  }
  if (filterForm) {
    filterForm.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFiltersBtn?.click();
      }
    });
  }

  function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
  }

  function renderPagination() {
    if (!paginationEl) return;
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }
    paginationEl.innerHTML = `
      <button type="button" class="btn btn-secondary" id="prevPageBtn" ${currentPage <= 1 ? 'disabled' : ''}>Prev</button>
      <span class="pagination-label">Page ${currentPage} of ${totalPages}</span>
      <button type="button" class="btn btn-secondary" id="nextPageBtn" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
    `;
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', async () => {
        if (currentPage <= 1) return;
        currentPage -= 1;
        if (currentMode === 'filtered') await loadFilteredCourses();
        else await loadInitialCourses();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', async () => {
        if (currentPage >= totalPages) return;
        currentPage += 1;
        if (currentMode === 'filtered') await loadFilteredCourses();
        else await loadInitialCourses();
      });
    }
  }

  async function loadFilteredCourses() {
    try {
      const queryParams = new URLSearchParams();
      const searchTitle = (document.getElementById('searchTitle')?.value || '').trim();
      const searchCode = (document.getElementById('searchCode')?.value || '').trim();
      const searchInstructor = (document.getElementById('searchInstructor')?.value || '').trim();
      const filterType = (document.getElementById('filterType')?.value || '').trim();
      const minCredits = (document.getElementById('minCredits')?.value || '').trim();
      const maxCredits = (document.getElementById('maxCredits')?.value || '').trim();
      const minCapacity = (document.getElementById('minCapacity')?.value || '').trim();
      const maxCapacity = (document.getElementById('maxCapacity')?.value || '').trim();
      const filterEnrolled = (document.getElementById('filterEnrolled')?.value || '').trim();
      const sortField = (document.getElementById('sortField')?.value || '').trim();
      const sortDirection = (document.getElementById('sortDirection')?.value || '').trim();
      const fieldsProjection = (document.getElementById('fieldsProjection')?.value || '').trim();

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
      queryParams.append('page', String(currentPage));
      queryParams.append('limit', String(pageSize));

      const queryString = queryParams.toString();
      const url = `/api/courses${queryString ? '?' + queryString : ''}`;
      coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">Loading courses...</p>';

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const msg = data?.error || 'Error loading courses';
        const details = data?.details && Array.isArray(data.details) ? data.details.join('; ') : '';
        coursesContainer.innerHTML = `<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">${escapeHtml(msg)}${details ? ' — ' + escapeHtml(details) : ''}</p>`;
        return;
      }
      const courses = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      totalPages = data?.pagination?.totalPages || 1;
      if (courses.length === 0) {
        coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No courses found</p>';
        renderPagination();
        return;
      }
      renderCourses(courses);
      renderPagination();
    } catch (error) {
      console.error('Error:', error);
      coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
      if (paginationEl) paginationEl.innerHTML = '';
    }
  }

  async function loadInitialCourses() {
    try {
      const response = await fetch(`/api/courses?page=${encodeURIComponent(currentPage)}&limit=${encodeURIComponent(pageSize)}`);
      const data = await response.json();
      if (!response.ok) {
        const msg = data?.error || 'Error loading courses';
        const details = data?.details && Array.isArray(data.details) ? data.details.join('; ') : '';
        coursesContainer.innerHTML = `<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">${escapeHtml(msg)}${details ? ' — ' + escapeHtml(details) : ''}</p>`;
        return;
      }
      const courses = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
      totalPages = data?.pagination?.totalPages || 1;
      if (courses.length === 0) {
        coursesContainer.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No courses found</p>';
        renderPagination();
        return;
      }
      renderCourses(courses);
      renderPagination();
    } catch (error) {
      console.error('Error:', error);
      coursesContainer.innerHTML = '<p style="text-align: center; color: #d32f2f; grid-column: 1/-1;">Error loading courses</p>';
      if (paginationEl) paginationEl.innerHTML = '';
    }
  }

  function renderCourses(courses) {
    coursesContainer.innerHTML = courses.map((course) => {
      const pct = course.capacity ? Math.round(((course.enrolled || 0) / course.capacity) * 100) : 0;
      return `
      <div class="course-card">
        <div class="course-card-header">
          <h2>${(course.title || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>
          <span class="course-code">${(course.code || 'N/A').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
        </div>
        <div class="course-card-body">
          <p class="course-description">${(course.description || 'No description').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          <div class="course-meta">
            ${course.credits !== undefined ? `<div class="course-meta-item"><strong>${course.credits}</strong><small>Credits</small></div>` : ''}
            ${course.instructor ? `<div class="course-meta-item"><strong>${(course.instructor + '').replace(/</g, '&lt;')}</strong><small>Instructor</small></div>` : ''}
          </div>
          <div class="course-meta">
            ${course.schedule ? `<div class="course-meta-item"><strong>${(course.schedule + '').replace(/</g, '&lt;')}</strong><small>Times</small></div>` : ''}
            ${course.room ? `<div class="course-meta-item"><strong>${(course.room + '').replace(/</g, '&lt;')}</strong><small>Location</small></div>` : ''}
          </div>
          ${course.capacity !== undefined ? `
          <div class="enrollment-status"><strong>${course.enrolled || 0}/${course.capacity}</strong> Students Enrolled
            <div class="progress-bar"><div class="progress-fill" style="width: ${pct}%;"></div></div>
          </div>
          ` : ''}
        </div>
        <div class="course-card-footer course-actions">
          <a class="btn btn-primary" href="/courses/${(course.id + '').replace(/"/g, '&quot;')}">${escapeHtml(viewActionLabel)}</a>
          ${showDropButton ? `<button type="button" class="btn btn-drop" data-course-id="${(course.id + '').replace(/"/g, '&quot;')}">Drop</button>` : ''}
          ${showDeleteButton ? `<button type="button" class="btn btn-delete" data-course-id="${(course.id + '').replace(/"/g, '&quot;')}">Delete</button>` : ''}
        </div>
      </div>
    `;
    }).join('');

    // Attach delete handlers (no inline onclick)
    coursesContainer.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', function () {
        const courseId = this.getAttribute('data-course-id');
        if (courseId) deleteCourse(courseId);
      });
    });
    coursesContainer.querySelectorAll('.btn-drop').forEach((btn) => {
      btn.addEventListener('click', function () {
        const courseId = this.getAttribute('data-course-id');
        if (courseId) dropCourse(courseId);
      });
    });
  }

  // ========== MODAL ==========
  const modal = document.getElementById('courseModal');
  const addCourseBtn = document.getElementById('addCourseBtn');
  const closeModalBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const courseFormEl = document.getElementById('courseForm');
  const alertMessage = document.getElementById('alertMessage');

  function closeModalWindow() {
    if (modal) modal.classList.remove('show');
    if (alertMessage) {
      alertMessage.classList.remove('show');
      alertMessage.textContent = '';
    }
  }

  if (addCourseBtn && modal && courseFormEl && alertMessage) {
    addCourseBtn.addEventListener('click', () => {
      modal.classList.add('show');
      courseFormEl.reset();
      alertMessage.classList.remove('show');
    });
  }
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModalWindow);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModalWindow);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModalWindow();
    });
  }

  function showAlert(message, type) {
    if (!alertMessage) return;
    alertMessage.textContent = message;
    alertMessage.className = `alert show alert-${type}`;
  }

  if (courseFormEl) {
    courseFormEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = {
        title: document.getElementById('title')?.value,
        code: document.getElementById('code')?.value,
        type: document.getElementById('type')?.value,
        credits: document.getElementById('credits')?.value,
        description: document.getElementById('description')?.value,
        instructor: document.getElementById('instructor')?.value,
        email: document.getElementById('email')?.value,
        schedule: document.getElementById('schedule')?.value,
        room: document.getElementById('room')?.value,
        capacity: document.getElementById('capacity')?.value,
        enrolled: document.getElementById('enrolled')?.value,
        prerequisites: document.getElementById('prerequisites')?.value,
      };
      try {
        const response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.status === 401) {
          showAlert('Please login to perform this action', 'error');
          setTimeout(() => { window.location.href = '/login'; }, 800);
          return;
        }
        if (response.status === 403) {
          showAlert(data?.error || 'Not accessible for your role', 'error');
          return;
        }
        if (response.ok) {
          showAlert('Course added successfully!', 'success');
          setTimeout(() => { closeModalWindow(); loadInitialCourses(); }, 1500);
        } else {
          const msg = data?.error || 'Error adding course';
          const details = data?.details && Array.isArray(data.details) ? data.details.join('; ') : '';
          showAlert(details ? `${msg}: ${details}` : msg, 'error');
        }
      } catch (error) {
        showAlert('Error adding course: ' + error.message, 'error');
      }
    });
  }

  function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    fetch(`/api/courses/${courseId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          alert('Please login to perform this action');
          window.location.href = '/login';
          return;
        }
        if (response.status === 403) {
          alert(data?.error || 'Not accessible for your role');
          return;
        }
        if (response.ok) {
          alert('Course deleted successfully!');
          loadInitialCourses();
        } else {
          alert(data?.error || 'Error deleting course');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error deleting course: ' + error.message);
      });
  }
  window.deleteCourse = deleteCourse;

  function dropCourse(courseId) {
    if (!confirm('Drop this course?')) return;
    fetch(`/api/courses/${courseId}/drop`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          alert('Please login to perform this action');
          window.location.href = '/login';
          return;
        }
        if (response.status === 403) {
          alert(data?.error || 'Not accessible for your role');
          return;
        }
        if (response.ok) {
          alert('You have dropped this course');
          loadInitialCourses();
        } else {
          alert(data?.error || 'Error dropping course');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error dropping course: ' + error.message);
      });
  }
  window.dropCourse = dropCourse;

  loadInitialCourses();
});
