import { auth } from './firebase.js';

// Only run if user is authenticated (should always be true on dashboard)
if (auth.currentUser) {
  // Push an initial state to capture the current page
  history.pushState({ dashboard: true }, '', window.location.href);

  // Listen for back button presses
  window.addEventListener('popstate', (event) => {
    // Prevent actual navigation by pushing a new state immediately
    history.pushState({ dashboard: true }, '', window.location.href);

    // Show the existing logout modal
    const modal = document.getElementById('logoutModal');
    if (modal) {
      modal.classList.add('active');
    }
  });
}
