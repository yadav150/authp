import { auth } from './firebase.js';
import {
  signInWithPopup,
  GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const githubBtn = document.getElementById('github-signin');
if (githubBtn) {
  githubBtn.addEventListener('click', async () => {
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // auth-flow.js will handle the redirect to dashboard on login
    } catch (error) {
      // The existing status message logic in auth.js can be reused,
      // but for simplicity we just log the error. You can enhance if desired.
      console.error('GitHub sign-in failed:', error.message);
    }
  });
}
