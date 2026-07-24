import { auth, signOut } from './firebase.js';

const IDLE_TIME = 30 * 1000;          // 30 seconds (demo)
const WARNING_TIME = 10 * 1000;       // 10 seconds (demo)
let idleTimer, warningTimer;

const timeoutModal = document.getElementById('timeoutModal');
const stayBtn = document.getElementById('staySignedInBtn');
const logoutBtn = document.getElementById('timeoutLogoutBtn');

// Reset idle timer and hide modal
function resetIdle() {
  clearTimeout(idleTimer);
  clearTimeout(warningTimer);
  timeoutModal.classList.remove('active');
  idleTimer = setTimeout(showWarning, IDLE_TIME);
}

// Show the timeout warning modal
function showWarning() {
  timeoutModal.classList.add('active');
  // Start an auto‑logout timer
  warningTimer = setTimeout(performLogout, WARNING_TIME);
}

// Perform logout (can be triggered by button or auto)
async function performLogout() {
  clearTimeout(warningTimer);
  timeoutModal.classList.remove('active');
  try {
    await signOut(auth);
    // onAuthStateChanged in dashboard.js will redirect to auth.html
  } catch (e) {
    // fallback
    window.location.replace('auth.html');
  }
}

// User activity events – reset timer on any interaction
['click', 'keypress', 'scroll', 'mousemove', 'touchstart'].forEach(event => {
  window.addEventListener(event, resetIdle, { passive: true });
});

// Button handlers
stayBtn.addEventListener('click', resetIdle);
logoutBtn.addEventListener('click', performLogout);

// Start the idle timer when the page loads
resetIdle();
