import {
  auth,
  signOut,
  onAuthStateChanged,
  updateProfile
} from './firebase.js';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'nhxuht4e';
const CLOUDINARY_UPLOAD_PRESET = 'yadav_auth_preset';
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// DOM elements
const profilePhoto = document.getElementById('profilePhoto');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const toggleEditBtn = document.getElementById('toggleEditBtn');
const editPanel = document.getElementById('editPanel');
const editName = document.getElementById('editName');
const editEmail = document.getElementById('editEmail');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const photoInput = document.getElementById('photoInput');
const photoUploadMsg = document.getElementById('photoUploadMsg');
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogoutBtn = document.getElementById('confirmLogout');

// Protect the page – redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    populateDashboard(user);
  } else {
    window.location.href = 'auth.html';
  }
});

function populateDashboard(user) {
  const name = user.displayName || user.email.split('@')[0] || 'User';
  profileName.textContent = `Welcome, ${name}`;
  editName.value = name;

  profileEmail.textContent = user.email;
  editEmail.value = user.email;

  // Photo: use Google photoURL, or show initials
  if (user.photoURL) {
    profilePhoto.innerHTML = `<img src="${user.photoURL}" alt="Profile" />`;
  } else {
    const initials = getInitials(name);
    profilePhoto.innerHTML = `<div class="initials-placeholder">${initials}</div>`;
  }

  // Store user reference for later updates
  window.currentUser = user;
}

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || 'U').toUpperCase();
}

// ---------- Edit Profile ----------
toggleEditBtn.addEventListener('click', () => {
  editPanel.classList.toggle('active');
});

saveProfileBtn.addEventListener('click', async () => {
  const newName = editName.value.trim();
  if (newName && window.currentUser) {
    try {
      await updateProfile(window.currentUser, { displayName: newName });
      profileName.textContent = `Welcome, ${newName}`;
      // Update initials if no photo
      if (!window.currentUser.photoURL) {
        profilePhoto.innerHTML = `<div class="initials-placeholder">${getInitials(newName)}</div>`;
      }
      editPanel.classList.remove('active');
    } catch (error) {
      alert(error.message);
    }
  }
});

// ---------- Photo Upload to Cloudinary ----------
photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  photoUploadMsg.innerHTML = '<div class="success-msg">Uploading...</div>';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const res = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.secure_url) {
      // Update Firebase profile with the new photo URL
      await updateProfile(window.currentUser, { photoURL: data.secure_url });
      // Refresh current user object (so photoURL is available next time)
      window.currentUser.photoURL = data.secure_url;
      // Show photo in the dashboard
      profilePhoto.innerHTML = `<img src="${data.secure_url}" alt="Profile" />`;
      photoUploadMsg.innerHTML = '<div class="success-msg">Profile photo updated successfully.</div>';
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    photoUploadMsg.innerHTML = `<div class="error-msg">Error: ${error.message}</div>`;
  }
});

// ---------- Logout Modal ----------
logoutBtn.addEventListener('click', () => {
  logoutModal.classList.add('active');
});

cancelLogout.addEventListener('click', () => {
  logoutModal.classList.remove('active');
});

confirmLogoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'auth.html';
  } catch (error) {
    alert(error.message);
  }
});

// Close modal on overlay click
logoutModal.addEventListener('click', (e) => {
  if (e.target === logoutModal) {
    logoutModal.classList.remove('active');
  }
});

// ---------- Menu Panel Toggle ----------
const menuButtons = document.querySelectorAll('.menu-option');
const optionPanels = document.querySelectorAll('.option-panel');

function hideAllPanels() {
  optionPanels.forEach(p => p.classList.remove('active'));
}

menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const panelId = btn.getAttribute('data-panel');
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      if (targetPanel.classList.contains('active')) {
        targetPanel.classList.remove('active');
      } else {
        hideAllPanels();
        targetPanel.classList.add('active');
      }
    }
  });
});
