document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("create-instructor-form");
  const firstnameInput = document.getElementById("firstname-input");
  const surnameInput = document.getElementById("surname-input");
  const emailInput = document.getElementById("email-input");
  const phoneInput = document.getElementById("phone-input");
  const passwordInput = document.getElementById("password-input");
  const statusMessage = document.getElementById("status-message");

  if (!form) return;

  function normalizeForEmail(value) {
    if (typeof value !== "string") return "";
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  }

  function buildEmail() {
    const first = normalizeForEmail(firstnameInput.value);
    const last = normalizeForEmail(surnameInput.value);
    if (!first || !last) return "";
    return `${first}_${last}@university.edu`;
  }

  function updateEmail() {
    emailInput.value = buildEmail();
  }

  firstnameInput.addEventListener("input", updateEmail);
  surnameInput.addEventListener("input", updateEmail);
  updateEmail();

  function setStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.remove("error", "success");
    statusMessage.classList.add(isError ? "error" : "success");
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstname = firstnameInput.value.trim();
    const surname = surnameInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value;

    if (!firstname || !surname || !phone || !password) {
      setStatus("All fields are required", true);
      return;
    }
    if (password.length < 8) {
      setStatus("Password must be at least 8 characters", true);
      return;
    }

    try {
      const response = await fetch("/api/instructors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstname, surname, phone, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = Array.isArray(data.details) ? data.details.join(". ") : "";
        setStatus(details || data.error || "Failed to create instructor", true);
        return;
      }

      setStatus(`Instructor created: ${data.instructor?.email || buildEmail()}`, false);
      form.reset();
      updateEmail();
    } catch (error) {
      setStatus(`Request failed: ${error.message}`, true);
    }
  });
});
