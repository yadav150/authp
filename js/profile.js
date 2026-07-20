/* ============================================================
   Profile – Profile Page Logic
   Loads user data, handles profile form submission,
   and account actions (logout, delete account placeholder).
   ============================================================ */

import { getCurrentUser, logout } from './auth-service.js';
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from './firebase-config.js';
import notification from './notification.js';
import { redirectTo, escapeHtml } from './utils.js';

/**
 * Initialize the profile page.
 */
export function initProfile() {
  const user = getCurrentUser();
  if (!user) return;

  populateUserInfo(user);
  setupProfileForm(user);
  setupLogoutButton();
  setupDeleteAccountButton(user);
}

/**
 * Fill static profile information (avatar, name, email, metadata).
 */
function populateUserInfo(user) {
  // Avatar
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) {
    avatarEl.src = user.photoURL || 'assets/icons/user-avatar.svg';
    avatarEl.alt = user.displayName || 'User avatar';
  }

  // Display name
  const nameEl = document.getElementById('profileDisplayName');
  if (nameEl) {
    nameEl.textContent = user.displayName || 'User';
  }

  // Email
  const emailEl = document.getElementById('profileEmail');
  if (emailEl) {
    emailEl.textContent = user.email || '';
  }

  // Account created
  const createdEl = document.getElementById('profileCreated');
  if (createdEl && user.metadata?.creationTime) {
    createdEl.textContent = `Member since ${new Date(user.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  }

  // Last sign-in
  const lastSignInEl = document.getElementById('profileLastSignIn');
  if (lastSignInEl && user.metadata?.lastSignInTime) {
    lastSignInEl.textContent = `Last sign-in: ${new Date(user.metadata.lastSignInTime).toLocaleString()}`;
  }

  // Email verified
  const verifiedEl = document.getElementById('profileVerified');
  if (verifiedEl) {
    verifiedEl.textContent = user.emailVerified ? 'Verified' : 'Not verified';
  }

  // Fill form fields with current values
  const nameInput = document.getElementById('profileNameInput');
  if (nameInput) {
    nameInput.value = user.displayName || '';
  }
}

/**
 * Set up the profile edit form (display name update).
 */
function setupProfileForm(user) {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('profileNameInput');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!nameInput || !submitBtn) return;

    const newName = nameInput.value.trim();
    if (!newName) {
      notification.warning('Name cannot be empty');
      return;
    }

    // Avoid unnecessary update
    if (newName === (user.displayName || '')) {
      notification.info('No changes detected');
      return;
    }

    setButtonLoading(submitBtn, true);

    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      // Update UI
      const nameEl = document.getElementById('profileDisplayName');
      if (nameEl) nameEl.textContent = newName;
      // Update navbar user name (if visible)
      const navNameEls = document.querySelectorAll('.navbar__user-name');
      navNameEls.forEach(el => el.textContent = newName);

      notification.success('Profile updated successfully');
    } catch (error) {
      notification.error('Failed to update profile', error.message);
    } finally {
      setButtonLoading(submitBtn, false);
    }
  });
}

/**
 * Profile-specific logout button.
 */
function setupLogoutButton() {
  const logoutBtn = document.getElementById('profileLogoutBtn');
  if (!logoutBtn || logoutBtn.dataset.bound === 'true') return;
  logoutBtn.dataset.bound = 'true';

  logoutBtn.addEventListener('click', async () => {
    try {
      await logout();
      notification.success('Logged out successfully');
      setTimeout(() => redirectTo('index.html'), 800);
    } catch (error) {
      notification.error('Logout failed', error.message);
    }
  });
}

/**
 * Danger zone: delete account (placeholder with confirmation).
 */
function setupDeleteAccountButton(user) {
  const deleteBtn = document.getElementById('deleteAccountBtn');
  if (!deleteBtn || deleteBtn.dataset.bound === 'true') return;
  deleteBtn.dataset.bound = 'true';

  deleteBtn.addEventListener('click', () => {
    // For safety, we'll just show a notification explaining the limitation.
    // Actual account deletion can be implemented via Firebase Auth admin SDK or client function.
    notification.info(
      'Account deletion is not available in this demo.',
      'Contact support to permanently delete your account.',
      6000
    );
  });
}

/**
 * Small helper: set button loading state.
 */
function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.classList.add('btn-loading');
    button._text = button.textContent;
    button.textContent = '';
  } else {
    button.disabled = false;
    button.classList.remove('btn-loading');
    if (button._text) button.textContent = button._text;
  }
}

// Auto-init when script is on profile page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProfile);
} else {
  initProfile();
}
