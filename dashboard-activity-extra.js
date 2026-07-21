import { auth, onAuthStateChanged } from './firebase.js';

function formatDate(isoString) {
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

  const activityTimes = document.querySelectorAll('.activity-card .activity-item .activity-time');

  // Account created (second item)
  if (activityTimes.length >= 2) {
    activityTimes[1].textContent = formatDate(user.metadata.creationTime);
  }

  // Email verified (third item)
  if (activityTimes.length >= 3) {
    activityTimes[2].textContent = user.emailVerified ? 'Verified' : 'Not verified';
  }
});
