// Shared auth UI helper for static HTML pages.
// Uses session cookie auth via GET /api/me.
document.addEventListener('DOMContentLoaded', () => {
  const authLink = document.getElementById('auth-link');
  const logoutLink = document.getElementById('logout-link');
  const nav = document.querySelector('.nav');

  if (!authLink && !logoutLink) return;

  function upsertAdminInstructorLink(show) {
    if (!nav) return;
    const existing = document.getElementById('admin-instructors-nav-link');
    if (!show) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    const link = document.createElement('a');
    link.id = 'admin-instructors-nav-link';
    link.href = '/admin-instructors';
    link.textContent = 'Add Instructor';
    nav.appendChild(link);
  }

  async function refreshAuthLinks() {
    try {
      const res = await fetch('/api/me', { credentials: 'include' });
      const data = await res.json();

      if (data && data.authenticated) {
        const user = data.user || {};
        if (authLink) {
          const name = user.firstname
            ? `${user.firstname}${user.surname ? ' ' + user.surname : ''}`
            : 'Profile';
          authLink.textContent = name;
          authLink.href = '/profile';
        }
        const coursesNav = document.getElementById('courses-nav-link');
        if (coursesNav) {
          const role = (user.role || 'student').toLowerCase();
          coursesNav.href = role === 'admin' ? '/admin-courses' : role === 'instructor' ? '/instructor-courses' : '/courses';
          coursesNav.textContent = role === 'instructor' ? 'My Courses' : 'Courses';
          upsertAdminInstructorLink(role === 'admin');
        }
        if (logoutLink) logoutLink.style.display = 'inline-block';
      } else {
        if (authLink) {
          authLink.textContent = 'Login';
          authLink.href = '/login';
        }
        const coursesNav = document.getElementById('courses-nav-link');
        if (coursesNav) {
          coursesNav.href = '/courses';
          coursesNav.textContent = 'Courses';
        }
        upsertAdminInstructorLink(false);
        if (logoutLink) logoutLink.style.display = 'none';
      }
    } catch (_) {
      // If /api/me fails, keep default links.
      upsertAdminInstructorLink(false);
    }
  }

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = '/login';
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  refreshAuthLinks();
});
