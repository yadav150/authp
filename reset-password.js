import { auth, confirmPasswordReset, verifyPasswordResetCode } from './firebase.js';

// Note: add confirmPasswordReset and verifyPasswordResetCode to firebase.js exports.
// They are imported from firebase-auth.

const urlParams = new URLSearchParams(window.location.search);
const oobCode = urlParams.get('oobCode');
const statusDiv = document.getElementById('reset-status');

if (!oobCode) {
  showStatus('Invalid or missing reset code. Please request a new password reset.', 'error');
} else {
  // Verify the code is valid
  verifyPasswordResetCode(auth, oobCode)
    .catch(() => {
      showStatus('This password reset link has expired or is invalid. Please request a new one.', 'error');
    });
}

document.getElementById('reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  let valid = true;

  if (newPassword.length < 6) {
    setFieldError('new-password', true);
    valid = false;
  } else {
    setFieldError('new-password', false);
  }

  if (confirmPassword !== newPassword) {
    setFieldError('confirm-password', true);
    valid = false;
  } else {
    setFieldError('confirm-password', false);
  }

  if (!valid || !oobCode) return;

  const btn = document.querySelector('#reset-form button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Resetting…';
  showStatus('Resetting password…', 'info');

  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    showStatus('Password has been reset successfully! You can now log in with your new password.', 'success');
    // Optionally redirect after a few seconds
    setTimeout(() => { window.location.href = 'auth.html'; }, 4000);
  } catch (error) {
    showStatus(error.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Reset Password';
  }
});

// Helpers (same as in auth.js)
function showStatus(msg, type = 'info') {
  statusDiv.textContent = msg;
  statusDiv.className = `status-message ${type}`;
}
function setFieldError(fieldId, hasError) {
  const group = document.getElementById(fieldId).closest('.form-group');
  group.classList.toggle('error', hasError);
}

// Password toggle (same logic as auth.js)
document.querySelectorAll('.password-toggle').forEach(button => {
  button.addEventListener('click', function () {
    const group = this.closest('.password-group');
    const input = group.querySelector('input');
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    const offIcon = this.querySelector('.eye-off');
    const onIcon = this.querySelector('.eye-on');
    if (type === 'text') {
      offIcon.style.display = 'none';
      onIcon.style.display = '';
    } else {
      offIcon.style.display = '';
      onIcon.style.display = 'none';
    }
  });
});
