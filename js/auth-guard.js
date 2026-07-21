/* ============================================================
   Auth Guard – Route Protection & Session Monitoring
   Waits for Firebase to confirm auth state before redirect.
   ============================================================ */

import { onAuthChange } from './auth-service.js';
import { getCurrentPage, redirectTo } from './utils.js';
import notification from './notification.js';

/**
 * Protect the current page.
 * Shows a page loader until Firebase confirms the auth state.
 * If unauthenticated, redirects to login.
 * Sets up a listener for session expiry.
 */
export function protectPage() {
  const currentPage = getCurrentPage();

  // Show a full-page loader while waiting for auth state
  showPageLoader(true);

  // Wait for the first auth state callback
  const unsubscribe = onAuthChange((user) => {
    // First call – hide loader and decide
    unsubscribe();

    if (user) {
      // Authenticated – allow access
      showPageLoader(false);
      // Listen for future sign-outs (session expiry)
      onAuthChange((updatedUser) => {
        if (!updatedUser) {
          notification.warning(
            'Session expired',
            'Please log in again to continue.',
            0
          );
          setTimeout(() => {
            redirectTo('login.html', getCurrentPage());
          }, 1500);
        }
      });
    } else {
      // Not authenticated – redirect to login
      redirectTo('login.html', currentPage);
    }
  });
}

/**
 * Helper: show/hide a page-wide loader.
 * Assumes a #pageLoader element exists on protected pages.
 */
function showPageLoader(visible) {
  const loader = document.getElementById('pageLoader');
  if (!loader) return;
  loader.style.display = visible ? 'flex' : 'none';
}

/**
 * Check if a user is already logged in and redirect away from auth pages.
 */
export function redirectIfAuthenticated() {
  const unsubscribe = onAuthChange((user) => {
    unsubscribe();
    if (user) {
      redirectTo('dashboard.html');
    }
  });
}
