import { auth, onAuthStateChanged } from './firebase.js';

// When the user is not logged in, replace the current history entry
// so the Back button won't return to this page.
onAuthStateChanged((user) => {
  if (!user) {
    window.location.replace('auth.html');
  }
});
