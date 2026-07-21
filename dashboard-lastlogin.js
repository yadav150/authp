import { auth, onAuthStateChanged } from './firebase.js';

function formatTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  // Find the first activity time element (the one for "Logged in")
  const loggedInTimeEl = document.querySelector('.activity-card .activity-item .activity-time');
  if (loggedInTimeEl) {
    loggedInTimeEl.textContent = formatTime(user.metadata.lastSignInTime);
  }
});
