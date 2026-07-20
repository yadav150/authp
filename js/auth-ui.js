/* ============================================================
   Auth UI – Login, Signup, Forgot Password Form Handlers
   Client-side validation and DOM interaction for auth pages.
   ============================================================ */

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  resetPassword,
} from './auth-service.js';
import { redirectIfAuthenticated } from './auth-guard.js';
import notification from './notification.js';
import {
  isValidEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  getQueryParam,
  redirectTo,
} from './utils.js';

/**
 * Initialize the auth page.
 * Detects which page we're on and sets up the appropriate form.
 */
export function initAuthUI() {
  // If already logged in, go to dashboard
  redirectIfAuthenticated();

  const page = getCurrentPage();

  switch (page) {
    case 'login.html':
      setupLoginForm();
      setupGoogleButton('.btn-google', 'login');
      break;
    case 'signup.html':
      setupSignupForm();
      setupGoogleButton('.btn-google', 'signup');
      break;
    case 'forgot-password.html':
      setupForgotPasswordForm();
      break;
  }

  // Enable password visibility toggles on all auth pages
  setupPasswordToggles();
}

/**
 * Helper to get current page filename.
 */
function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
}

/* ---- Login Form ---- */
function setupLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const submitBtn = form.querySelector('button[type="submit"]');

    // Client validation
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    clearErrors(form);
    let hasError = false;

    if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }
    if (!password) {
      showFieldError(passwordInput, 'Password is required.');
      hasError = true;
    }
    if (hasError) return;

    // Loading state
    setButtonLoading(submitBtn, true);

    try {
      await signInWithEmail(email, password);
      notification.success('Login successful!', 'Redirecting to your dashboard...');
      // Redirect to saved URL or dashboard
      const redirect = getQueryParam('redirect') || 'dashboard.html';
      setTimeout(() => redirectTo(redirect), 800);
    } catch (error) {
      notification.error('Login failed', error.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---- Signup Form ---- */
function setupSignupForm() {
  const form = document.getElementById('signupForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const passwordInput = form.querySelector('#password');
    const confirmPasswordInput = form.querySelector('#confirmPassword');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = nameInput?.value.trim() || '';
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput?.value || '';

    clearErrors(form);
    let hasError = false;

    // Name validation (optional but recommended)
    if (nameInput && !name) {
      showFieldError(nameInput, 'Please enter your name.');
      hasError = true;
    }

    if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      hasError = true;
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      showFieldError(passwordInput, passwordCheck.message);
      hasError = true;
    }

    const matchCheck = validatePasswordMatch(password, confirmPassword);
    if (!matchCheck.valid && confirmPasswordInput) {
      showFieldError(confirmPasswordInput, matchCheck.message);
      hasError = true;
    }

    if (hasError) return;

    setButtonLoading(submitBtn, true);

    try {
      await signUpWithEmail(email, password, name);
      notification.success('Account created successfully!', 'Welcome aboard! Redirecting...');
      const redirect = getQueryParam('redirect') || 'dashboard.html';
      setTimeout(() => redirectTo(redirect), 1000);
    } catch (error) {
      notification.error('Sign-up failed', error.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---- Forgot Password Form ---- */
function setupForgotPasswordForm() {
  const form = document.getElementById('forgotPasswordForm');
  if (!form) return;

  const successMessage = document.getElementById('forgotPasswordSuccess');
  const formSection = document.getElementById('forgotPasswordFormSection');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = form.querySelector('#email');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();

    clearErrors(form);

    if (!isValidEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address.');
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      await resetPassword(email);
      // Show success message and hide form
      if (formSection) formSection.style.display = 'none';
      if (successMessage) successMessage.style.display = 'block';
      notification.success('Password reset email sent!', `Check your inbox at ${email}.`);
    } catch (error) {
      notification.error('Failed to send reset email', error.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/* ---- Google Sign-In Button ---- */
function setupGoogleButton(selector, context) {
  const btn = document.querySelector(selector);
  if (!btn) return;

  btn.addEventListener('click', async () => {
    setButtonLoading(btn, true);

    try {
      await signInWithGoogle();
      notification.success('Login successful!', 'Redirecting...');
      const redirect = getQueryParam('redirect') || 'dashboard.html';
      setTimeout(() => redirectTo(redirect), 800);
    } catch (error) {
      // Popup cancelled or other errors
      notification.error('Google sign-in failed', error.message);
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

/* ---- Password Visibility Toggle ---- */
function setupPasswordToggles() {
  const toggles = document.querySelectorAll('.password-toggle');
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const input = toggle.parentElement.querySelector('.form-input');
      if (!input) return;

      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      // Toggle icon (eye / eye-off)
      const svg = toggle.querySelector('svg');
      if (svg) {
        if (isPassword) {
          // Show eye-off
          svg.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`;
        } else {
          // Show eye
          svg.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
        }
      }
    });
  });
}

/* ---- Helper: Clear all field errors ---- */
function clearErrors(form) {
  form.querySelectorAll('.form-input--error').forEach((input) => {
    input.classList.remove('form-input--error');
  });
  form.querySelectorAll('.form-error').forEach((el) => el.remove());
}

/* ---- Helper: Show error on a field ---- */
function showFieldError(input, message) {
  input.classList.add('form-input--error');
  const errorEl = document.createElement('span');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  // Insert after the input or its wrapper
  const wrapper = input.closest('.password-wrapper') || input.parentElement;
  wrapper.after(errorEl);
}

/* ---- Helper: Set loading state on button ---- */
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add('btn-loading');
    button._originalText = button.textContent;
    button.textContent = '';
  } else {
    button.disabled = false;
    button.classList.remove('btn-loading');
    if (button._originalText) {
      button.textContent = button._originalText;
      delete button._originalText;
    }
  }
}
