/* ============================================================
   Firebase Config – SDK Initialization
   Your existing Firebase project configuration.
   Exports: app, auth (and analytics if needed)
   ============================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFnxF_v-fXGiZeL_OEMzmKrPdR1PE3KfU",
  authDomain: "auth-project-by-yadav.firebaseapp.com",
  projectId: "auth-project-by-yadav",
  storageBucket: "auth-project-by-yadav.firebasestorage.app",
  messagingSenderId: "351339588417",
  appId: "1:351339588417:web:37475410e0f70a6470cfc0",
  measurementId: "G-788ZZB8CTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const analytics = getAnalytics(app); // Optional analytics

// Export what the app needs
export { app, auth, analytics };
