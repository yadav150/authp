/* ============================================================
   Auth Guard – Route Protection & Session Monitoring
   Redirects unauthenticated users to login.
   Watches for session expiry on protected pages.
   ============================================================ */

import { onAuthChange, getCurrentUser } from './auth-service.js';
import { getCurrentPage, redirectTo } from './utils.js';
import notification from './notification.js';

/**
 * Protect the current page: if no user, redirect to login.
 * Also sets up a listener to detect session expiry.
 * Call this once on each protected page (dashboard, profile, etc.).
 */
export function protectPage() {
  const currentPage = getCurrentPage();

  // Immediate check (in case listener hasn't fired yet)
  const user = getCurrentUser();
  if (!user) {
    // User not signed in, redirect to login with return URL
    redirectTo('login.html', currentPage);
    return;
  }

  // Listen for future auth state changes
  onAuthChange((user) => {
    if (user) {
      // User is signed in – page remains accessible
      return;
    }

    // User became null while on a protected page → session expired
    notification.warning(
      'Session expired',
      'Please log in again to continue.',
      0 // sticky notification
    );

    // Redirect after a short delay so user sees the notification
    setTimeout(() => {
      redirectTo('login.html', getCurrentPage());
    }, 1500);
  });
}

/**
 * Check if a user is logged in, and if so redirect away from auth pages.
 * Call this on login, signup, and forgot-password pages.
 */
export function redirectIfAuthenticated() {
  const user = getCurrentUser();
  if (user) {
    redirectTo('dashboard.html');
  }
}
