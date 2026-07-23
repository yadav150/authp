import { auth } from './firebase.js';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const passwordInput = document.getElementById('deletePassword');
const consentCheckbox = document.getElementById('deleteConsent');
const confirmBtn = document.getElementById('confirmDeleteBtn');
const msgDiv = document.getElementById('deleteMsg');
const attemptModal = document.getElementById('attemptLimitModal');
const cancelAttemptBtn = document.getElementById('cancelAttemptModal');

let failedAttempts = 0;                     // track consecutive wrong passwords

// --- Helper: show message below the form ---
function showMsg(message, type) {
  const className = type === 'success' ? 'success-msg' : 'error-msg';
  msgDiv.innerHTML = `<div class="${className}">${message}</div>`;
}

// --- Enable/disable the delete button ---
function toggleDeleteButton() {
  confirmBtn.disabled = !(consentCheckbox.checked && passwordInput.value.trim() !== '');
}
consentCheckbox.addEventListener('change', toggleDeleteButton);
passwordInput.addEventListener('input', toggleDeleteButton);

// --- Attempt modal controls ---
cancelAttemptBtn.addEventListener('click', () => {
  attemptModal.classList.remove('active');
});
attemptModal.addEventListener('click', (e) => {
  if (e.target === attemptModal) attemptModal.classList.remove('active');
});

// --- Main delete action ---
confirmBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();

  // Immediate feedback if password is empty
  if (!password) {
    showMsg('Please enter your password.', 'error');
    return;
  }
  if (!consentCheckbox.checked) {
    showMsg('You must tick the consent checkbox.', 'error');
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting…';

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    window.location.replace('index.html');
  } catch (error) {
    // Increment failed attempts on authentication errors
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
      failedAttempts++;
    }

    // Show error message
    showMsg(error.message, 'error');

    // After 3 failures, show the modal and reset the button
    if (failedAttempts >= 3) {
      attemptModal.classList.add('active');
      // Reset attempts so the user must close the modal and re-enter
      failedAttempts = 0;
    }

    // Re-enable the button (but keep it disabled if modal is showing? no, we re-enable)
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete My Account';
    // Re-check conditions to maybe disable again if password empty
    toggleDeleteButton();
  }
});
