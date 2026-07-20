/* ============================================================
   App – Global Initialization
   Loaded on every page. Initializes navbar, auth UI,
   route protection, and the notification system.
   ============================================================ */

import notification from './notification.js'; // Ensure singleton exists
import { initNavbar } from './navbar.js';
import { protectPage } from './auth-guard.js';
import { initAuthUI } from './auth-ui.js';
import { getCurrentPage } from './utils.js';

/**
 * Initialize the application on DOM ready.
 */
function initApp() {
  // 1. Navbar (all pages)
  initNavbar();

  // 2. Page-specific logic based on filename
  const page = getCurrentPage();
  const protectedPages = ['dashboard.html', 'profile.html'];
  const authPages = ['login.html', 'signup.html', 'forgot-password.html'];

  if (protectedPages.includes(page)) {
    protectPage();
  }

  if (authPages.includes(page)) {
    initAuthUI();
  }

  // 3. Log that the app is ready (optional)
  console.log(`AuthDashboard: ${page} ready.`);
}

// Run when DOM is fully parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM already loaded (e.g., script is deferred/async or at end of body)
  initApp();
}
