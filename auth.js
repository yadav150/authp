import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile          // ← now imported and used
} from './firebase.js';

// ---------------- Panel switching ----------------
const panels = {
  login: document.getElementById('login-panel'),
  signup: document.getElementById('signup-panel'),
  forgot: document.getElementById('forgot-panel')
};
const statusDiv = document.getElementById('auth-status');

function showPanel(panelId) {
  Object.keys(panels).forEach(id => {
    const panel = panels[id];
    if (id === panelId) return;
    if (panel.style.display !== 'none') {
      panel.classList.add('fade-out');
      panel.addEventListener('transitionend', function handler() {
        panel.removeEventListener('transitionend', handler);
        panel.style.display = 'none';
        panel.classList.remove('fade-out');
      }, { once: true });
    }
  });

  const target = panels[panelId];
  if (target.style.display === 'none') {
    target.style.display = '';
    void target.offsetWidth;
    target.classList.add('fade-in');
    setTimeout(() => target.classList.remove('fade-in'), 300);
  }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('switch-to-login')) { e.preventDefault(); showPanel('login'); }
  else if (e.target.classList.contains('switch-to-signup')) { e.preventDefault(); showPanel('signup'); }
  else if (e.target.classList.contains('switch-to-forgot')) { e.preventDefault(); showPanel('forgot'); }
});

// ---------------- Status message helper ----------------
function showStatus(msg, type = 'info') {
  statusDiv.textContent = msg;
  statusDiv.className = `status-message ${type}`;
  setTimeout(() => { statusDiv.className = 'status-message'; statusDiv.textContent = ''; }, 8000);
}

// ---------------- Form validation helpers ----------------
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function setFieldError(fieldId, hasError) {
  const group = document.getElementById(fieldId).closest('.form-group');
  group.classList.toggle('error', hasError);
}
function setButtonLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]');
  if (btn) btn.disabled = loading;
}

// ============ Firebase Auth Handlers ============

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  let valid = true;

  if (!validateEmail(email)) { setFieldError('login-email', true); valid = false; } else setFieldError('login-email', false);
  if (password === '') { setFieldError('login-password', true); valid = false; } else setFieldError('login-password', false);
  if (!valid) return;

  setButtonLoading(e.target, true);
  showStatus('Logging in...', 'info');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showStatus(`Welcome back, ${userCredential.user.email}!`, 'success');
  } catch (error) {
    showStatus(error.message, 'error');
  } finally {
    setButtonLoading(e.target, false);
  }
});

// Sign Up (now saves the user's name)
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;
  let valid = true;

  if (name === '') { setFieldError('signup-name', true); valid = false; } else setFieldError('signup-name', false);
  if (!validateEmail(email)) { setFieldError('signup-email', true); valid = false; } else setFieldError('signup-email', false);
  if (password.length < 6) { setFieldError('signup-password', true); valid = false; } else setFieldError('signup-password', false);
  if (confirm !== password) { setFieldError('signup-confirm', true); valid = false; } else setFieldError('signup-confirm', false);
  if (!valid) return;

  setButtonLoading(e.target, true);
  showStatus('Creating your account...', 'info');
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Save the display name
    await updateProfile(userCredential.user, { displayName: name });
    // Send email verification
    await sendEmailVerification(userCredential.user);
    showStatus('Account created! A verification email has been sent to ' + email, 'success');
  } catch (error) {
    showStatus(error.message, 'error');
  } finally {
    setButtonLoading(e.target, false);
  }
});

// Forgot Password
document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  if (!validateEmail(email)) { setFieldError('forgot-email', true); return; }
  setFieldError('forgot-email', false);

  setButtonLoading(e.target, true);
  showStatus('Sending password reset email...', 'info');
  try {
    await sendPasswordResetEmail(auth, email);
    showStatus('Password reset email sent to ' + email, 'success');
  } catch (error) {
    showStatus(error.message, 'error');
  } finally {
    setButtonLoading(e.target, false);
  }
});

// Google Sign‑In
const googleBtn = document.getElementById('google-signin');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    showStatus('Redirecting to Google...', 'info');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showStatus(`Signed in as ${result.user.displayName || result.user.email}`, 'success');
    } catch (error) {
      showStatus(error.message, 'error');
    }
  });
}

// Auth state observer (optional)
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? user.email : 'logged out');
});

// ============ Password Toggle (show/hide) ============
document.querySelectorAll('.password-toggle').forEach(button => {
  button.addEventListener('click', function () {
    const group = this.closest('.password-group');
    const input = group.querySelector('input');
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    const offIcon = this.querySelector('svg[id$="-eye-off"]');
    const onIcon = this.querySelector('svg[id$="-eye-on"]');
    if (offIcon && onIcon) {
      if (type === 'text') {
        offIcon.style.display = 'none';
        onIcon.style.display = '';
      } else {
        offIcon.style.display = '';
        onIcon.style.display = 'none';
      }
    }
  });
});
