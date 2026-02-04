const form = document.getElementById('form');
const firstname_input = document.getElementById('firstname-input');
const surname_input = document.getElementById('surname-input');
const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
const repeat_password_input = document.getElementById('repeat-password-input');
const error_message = document.getElementById('error-message');

if (form) {
  form.addEventListener('submit', (e) => {
    let errors = [];

    if (firstname_input) {
      errors = getSignupFormErrors(firstname_input.value, surname_input.value, email_input.value, password_input.value, repeat_password_input.value);
    } else {
      errors = getLoginFormErrors(email_input.value, password_input.value);
    }

    if (errors.length > 0) {
      e.preventDefault();
      if (error_message) {
        error_message.innerText = errors.join(". ");
      }
    }
  });
}

function getSignupFormErrors(firstname, surname, email, password, repeatPassword) {
  let errors = [];

  if (!firstname || firstname.trim() === '') {
    errors.push('Firstname is required');
    if (firstname_input && firstname_input.parentElement) {
      firstname_input.parentElement.classList.add('incorrect');
    }
  }
  if (!surname || surname.trim() === '') {
    errors.push('Surname is required');
    if (surname_input && surname_input.parentElement) {
      surname_input.parentElement.classList.add('incorrect');
    }
  }
  if (!email || email.trim() === '') {
    errors.push('Email is required');
    if (email_input && email_input.parentElement) {
      email_input.parentElement.classList.add('incorrect');
    }
  }
  if (!password || password.trim() === '') {
    errors.push('Password is required');
    if (password_input && password_input.parentElement) {
      password_input.parentElement.classList.add('incorrect');
    }
  }
  if (password && password.length < 8) {
    errors.push('Password must have at least 8 characters');
    if (password_input && password_input.parentElement) {
      password_input.parentElement.classList.add('incorrect');
    }
  }
  if (password !== repeatPassword) {
    errors.push('Password does not match repeated password');
    if (password_input && password_input.parentElement) {
      password_input.parentElement.classList.add('incorrect');
    }
    if (repeat_password_input && repeat_password_input.parentElement) {
      repeat_password_input.parentElement.classList.add('incorrect');
    }
  }

  return errors;
}

function getLoginFormErrors(email, password) {
  let errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
    if (email_input && email_input.parentElement) {
      email_input.parentElement.classList.add('incorrect');
    }
  }
  if (!password || password.trim() === '') {
    errors.push('Password is required');
    if (password_input && password_input.parentElement) {
      password_input.parentElement.classList.add('incorrect');
    }
  }

  return errors;
}

const allInputs = [firstname_input, surname_input, email_input, password_input, repeat_password_input].filter(input => input != null);

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if (input.parentElement && input.parentElement.classList.contains('incorrect')) {
      input.parentElement.classList.remove('incorrect');
      if (error_message) {
        error_message.innerText = '';
      }
    }
  });
});
