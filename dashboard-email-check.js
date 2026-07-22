import { auth, onAuthStateChanged } from './firebase.js';

onAuthStateChanged(async (user) => {
  if (!user) return;

  // Force a fresh token to get the latest email verification status
  try {
    await user.reload();
  } catch (e) {
    // Network error – keep whatever we have
  }

  // Now update the "Email verified" line in the Activity card
  const activityTimes = document.querySelectorAll('.activity-card .activity-item .activity-time');
  if (activityTimes.length >= 3) {
    activityTimes[2].textContent = auth.currentUser?.emailVerified ? 'Verified' : 'Not verified';
  }
});
