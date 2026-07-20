/* ============================================================
   Utils – Shared Helper Functions
   Used across all JS modules. No dependencies.
   ============================================================ */

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength.
 * Minimum 6 characters (Firebase default minimum).
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate that two passwords match.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {{ valid: boolean, message: string }}
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match.' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate a required field is not empty.
 * @param {string} value
 * @param {string} fieldName
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return { valid: false, message: `${fieldName} is required.` };
  }
  return { valid: true, message: '' };
}

/**
 * Get a human-readable error message from Firebase Auth error codes.
 * @param {string} errorCode - Firebase error code (e.g., 'auth/user-not-found')
 * @returns {string}
 */
export function getFirebaseErrorMessage(errorCode) {
  const messages = {
    // Sign-up errors
    'auth/email-already-in-use': 'This email address is already registered. Please log in instead.',
    'auth/invalid-email': 'The email address is not valid.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/weak-password': 'The password is too weak. Please use at least 6 characters.',
    // Login errors
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    // Password reset
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    // Google sign-in
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups for this site.',
    'auth/cancelled-popup-request': 'Google sign-in request was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
    // Generic / Network
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/internal-error': 'An unexpected error occurred. Please try again.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid. Please request a new one.',
  };

  return messages[errorCode] || `An unexpected error occurred (${errorCode}). Please try again.`;
}

/**
 * Format a date into a readable string (e.g., "Mar 15, 2026").
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date relative to now (e.g., "2 hours ago").
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function timeAgo(dateInput) {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds} sec ago`;
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} mins ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Get a query parameter value from the current URL.
 * @param {string} param
 * @returns {string|null}
 */
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set a query parameter in the URL without reloading.
 * @param {string} param
 * @param {string} value
 */
export function setQueryParam(param, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(param, value);
  window.history.replaceState({}, '', url.toString());
}

/**
 * Redirect to a page, optionally with a return URL.
 * @param {string} path - e.g., 'login.html'
 * @param {string} [redirectParam] - current page to return to after login
 */
export function redirectTo(path, redirectParam) {
  let url = path;
  if (redirectParam) {
    const separator = path.includes('?') ? '&' : '?';
    url += `${separator}redirect=${encodeURIComponent(redirectParam)}`;
  }
  window.location.href = url;
}

/**
 * Get current page filename (e.g., "dashboard.html").
 * @returns {string}
 */
export function getCurrentPage() {
  const path = window.location.pathname;
  return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
}

/**
 * Escape HTML to prevent XSS when inserting user-generated content.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
