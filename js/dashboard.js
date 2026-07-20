/* ============================================================
   Dashboard – Dashboard Page Logic
   Loads user data, stat cards, and recent activity feed.
   ============================================================ */

import { getCurrentUser } from './auth-service.js';
import { formatDate, timeAgo } from './utils.js';
import notification from './notification.js';

/**
 * Initialize the dashboard page.
 * Call only on dashboard.html (via a dedicated <script type="module">).
 */
export function initDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  // Display user's name and join date
  updateWelcomeMessage(user);
  updateStatCards(user);
  loadRecentActivity(user);
}

/**
 * Show a personalised greeting with the user's display name.
 */
function updateWelcomeMessage(user) {
  const greetingEl = document.getElementById('dashboardGreeting');
  if (!greetingEl) return;

  const firstName = user.displayName
    ? user.displayName.split(' ')[0]
    : 'User';
  greetingEl.innerHTML = `Hello, <span>${escapeHtml(firstName)}</span>`;
}

/**
 * Fill the stat cards with real data from the user object.
 */
function updateStatCards(user) {
  // Account created date
  const createdDateEl = document.getElementById('statCreated');
  if (createdDateEl && user.metadata?.creationTime) {
    createdDateEl.textContent = formatDate(user.metadata.creationTime);
  }

  // Last sign-in
  const lastSignInEl = document.getElementById('statLastSignIn');
  if (lastSignInEl && user.metadata?.lastSignInTime) {
    lastSignInEl.textContent = timeAgo(user.metadata.lastSignInTime);
  }

  // Email verified status
  const verifiedEl = document.getElementById('statVerified');
  if (verifiedEl) {
    verifiedEl.textContent = user.emailVerified ? 'Yes' : 'No';
  }

  // Provider (simplified)
  const providerEl = document.getElementById('statProvider');
  if (providerEl) {
    const providers = user.providerData?.map(p => p.providerId).join(', ') || 'Email';
    providerEl.textContent = providers === 'password' ? 'Email' : providers;
  }
}

/**
 * Build a recent activity list based on user metadata.
 */
function loadRecentActivity(user) {
  const activityContainer = document.getElementById('activityList');
  if (!activityContainer) return;

  const activities = [];

  if (user.metadata?.lastSignInTime) {
    activities.push({
      title: 'Last login',
      time: timeAgo(user.metadata.lastSignInTime),
      type: 'info'
    });
  }

  if (user.metadata?.creationTime) {
    activities.push({
      title: 'Account created',
      time: formatDate(user.metadata.creationTime),
      type: 'success'
    });
  }

  activities.push({
    title: 'Dashboard visited',
    time: timeAgo(new Date()),
    type: 'info'
  });

  // Render
  activityContainer.innerHTML = activities
    .map(
      (act) => `
      <div class="activity-item">
        <span class="activity-item__dot activity-item__dot--${act.type}"></span>
        <div class="activity-item__content">
          <div class="activity-item__title">${escapeHtml(act.title)}</div>
          <div class="activity-item__time">${escapeHtml(act.time)}</div>
        </div>
      </div>
    `
    )
    .join('');

  // If no activities, show empty state
  if (activities.length === 0) {
    activityContainer.innerHTML = `
      <div class="dashboard__empty">
        <p>No recent activity to display.</p>
      </div>
    `;
  }
}

/**
 * Escape HTML to prevent XSS.
 */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// Auto-init if this script is on the dashboard page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
