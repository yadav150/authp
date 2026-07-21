import { auth, signOut, onAuthStateChanged } from './firebase.js';

let ignoreNextAuthChange = false;   // prevent redirect during signup flow

// ===== Observer for status messages =====
const statusDiv = document.getElementById('auth-status');

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      const text = statusDiv.textContent || '';
      if (text.includes('Account created!')) {
        handleSignupSuccess(text);
      }
    }
  }
});

observer.observe(statusDiv, { childList: true, subtree: true, characterData: true });

// ===== Signup success flow =====
async function handleSignupSuccess(originalMessage) {
  // 1. Sign out the auto‑logged‑in user
  ignoreNextAuthChange = true;
  try {
    await signOut(auth);
  } catch (e) {
    // if already signed out, ignore
  }
  ignoreNextAuthChange = false;

  // 2. Replace status message with a "Click here to login" button
  const emailMatch = originalMessage.match(/to (.+)$/);   // extract email
  const email = emailMatch ? emailMatch[1] : 'your email';

  statusDiv.className = 'status-message success';   // keep success styling
  statusDiv.innerHTML = `
    <div style="text-align:left;">
      <p style="margin:0 0 12px;">Account created! A verification email has been sent to <strong>${email}</strong>.</p>
      <button id="customGotoLogin" class="btn" style="background:var(--primary-color); border-color:var(--primary-color);">
        Click here to login
      </button>
    </div>
  `;

  // 3. Attach click handler to the new button
  const btn = document.getElementById('customGotoLogin');
  if (btn) {
    btn.addEventListener('click', () => {
      // Simulate click on the existing "Log in" link (switch to login panel)
      const loginLink = document.querySelector('.switch-to-login');
      if (loginLink) loginLink.click();
    });
  }
}

// ===== Auto‑redirect to dashboard after login =====
onAuthStateChanged(auth, (user) => {
  if (ignoreNextAuthChange) return;   // skip if we are in the middle of signup flow

  if (user) {
    // User is logged in → send to dashboard
    window.location.href = 'dashboard.html';
  }
});
