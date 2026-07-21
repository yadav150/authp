import { auth, sendEmailVerification } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  const verifyStatusEl = document.getElementById('verifyStatus');

  // Wait for auth state to be available (dashboard.js already sets it,
  // but we use an observer to be safe)
  auth.onAuthStateChanged((user) => {
    if (!user) return;

    updateVerificationUI(user);
  });
});

function updateVerificationUI(user) {
  const container = document.getElementById('verifyStatus');
  if (!container) return;

  const isVerified = user.emailVerified;

  if (isVerified) {
    container.innerHTML = `
      <div class="success-msg" style="margin-bottom:16px;">
        <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; stroke:#1e4620; fill:none; stroke-width:2;">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Email verified
      </div>
    `;
    return;
  }

  // Not verified – show message + resend button
  container.innerHTML = `
    <div class="error-msg" style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
      <span>
        <svg width="16" height="16" viewBox="0 0 24 24" style="vertical-align:middle; margin-right:6px; stroke:var(--primary-color); fill:none; stroke-width:2;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Email not verified.
      </span>
      <button id="resendVerifyBtn" class="btn" style="padding:4px 12px; font-size:0.85rem;">Resend</button>
    </div>
  `;

  // Attach event to the new button
  document.getElementById('resendVerifyBtn').addEventListener('click', async () => {
    const btn = document.getElementById('resendVerifyBtn');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      await sendEmailVerification(user);
      // Show temporary success
      btn.textContent = 'Sent!';
      btn.style.background = '#28a745';
      btn.style.borderColor = '#28a745';
      setTimeout(() => {
        // Refresh the verification UI after a few seconds
        // (user may have verified in the meantime)
        user.reload().then(() => updateVerificationUI(auth.currentUser));
      }, 3000);
    } catch (error) {
      alert('Failed to send verification email: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'Resend';
    }
  });
}
