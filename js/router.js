/* ============================================================
   Router – Simple Client-Side Routing Helper
   For SPAs or multi-page apps. Currently used for redirect
   logic, preserving query params, and handling 404 redirects.
   ============================================================ */

/**
 * Navigate to a new page, optionally preserving the current
 * `redirect` parameter in the URL for post-login return.
 * @param {string} path - e.g., 'login.html'
 * @param {Object} [options]
 * @param {string} [options.redirect] - page to return to after login
 * @param {boolean} [options.replace=false] - use replaceState instead of assign
 */
export function navigate(path, options = {}) {
  const { redirect, replace = false } = options;

  let url = path;
  if (redirect) {
    const sep = path.includes('?') ? '&' : '?';
    url += `${sep}redirect=${encodeURIComponent(redirect)}`;
  }

  if (replace) {
    window.location.replace(url);
  } else {
    window.location.href = url;
  }
}

/**
 * Get the redirect parameter from URL, defaulting to 'dashboard.html'.
 * @returns {string}
 */
export function getRedirectParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('redirect') || 'dashboard.html';
}

/**
 * Redirect to the custom 404 page, preserving the attempted URL.
 * @param {string} [attemptedPath] - the bad path the user tried
 */
export function redirectTo404(attemptedPath) {
  let url = '404.html';
  if (attemptedPath) {
    url += `?from=${encodeURIComponent(attemptedPath)}`;
  }
  window.location.replace(url);
}

/**
 * Simple path matching: checks if current page matches a pattern.
 * (Used if future SPA-like behavior is added.)
 * @param {string} pattern - e.g., '/dashboard'
 * @returns {boolean}
 */
export function isRoute(pattern) {
  return window.location.pathname.includes(pattern);
}
