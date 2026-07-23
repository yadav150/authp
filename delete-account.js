import { auth } from './firebase.js';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const passwordInput = document.getElementById('deletePassword');
const passwordGroup = document.getElementById('deletePasswordGroup');
const consentCheckbox = document.getElementById('deleteConsent');
const consentGroup = document.getElementById('deleteConsentGroup');
const confirmBtn = document.getElementById('confirmDeleteBtn');
const msgDiv = document.getElementById('deleteMsg');
const attemptModal = document.getElementById('attemptLimitModal');
const cancelAttemptBtn = document.getElementById('cancelAttemptModal');

let failedAttempts = 0;

// --- Utility: show message in the standard dashboard error/success style ---
function showMsg(message, type) {
  const className = type === 'success' ? 'success-msg' : 'error-msg';
  msgDiv.innerHTML = `<div class="${className}">${message}</div>`;
}

// --- Clear any error highlighting ---
function clearErrors() {
  passwordGroup.classList.remove('error');
  consentGroup.classList.remove('error');
}

// --- Highlight specific field ---
function highlightField(group) {
  if (group) group.classList.add('error');
}

// --- Attempt modal controls ---
cancelAttemptBtn.addEventListener('click', () => {
  attemptModal.classList.remove('active');
});
attemptModal.addEventListener('click', (e) => {
  if (e.target === attemptModal) attemptModal.classList.remove('active');
});

// --- Main delete handler ---
confirmBtn.addEventListener('click', async () => {
  clearErrors();          // reset any previous highlights
  const password = passwordInput.value.trim();
  const consentChecked = consentCheckbox.checked;
  let hasError = false;

  // Validate
  if (!password && !consentChecked) {
    highlightField(passwordGroup);
    highlightField(consentGroup);
    showMsg('Please enter your password and tick the consent checkbox.', 'error');
    return;
  }
  if (!password) {
    highlightField(passwordGroup);
    showMsg('Please enter your password.', 'error');
    return;
  }
  if (!consentChecked) {
    highlightField(consentGroup);
    showMsg('You must tick the consent checkbox.', 'error');
    return;
  }

  // Proceed
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting…';

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    window.location.replace('index.html');
  } catch (error) {
    // Friendly messages for common errors
    let friendlyMsg = 'An error occurred. Please try again.';
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      friendlyMsg = 'Incorrect password. Please try again.';
      failedAttempts++;
    } else if (error.code === 'auth/too-many-requests') {
      friendlyMsg = 'Too many attempts. Please wait a moment and try again.';
    } else {
      friendlyMsg = error.message; // fallback, but unlikely
    }

    showMsg(friendlyMsg, 'error');

    if (failedAttempts >= 3) {
      attemptModal.classList.add('active');
      failedAttempts = 0; // reset after showing modal
    }

    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete My Account';
  }
});
