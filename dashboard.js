import { auth, signOut, onAuthStateChanged, updateProfile } from './firebase.js';

// ===== Cloudinary config =====
const CLOUD_NAME = 'nhxuht4e';
const UPLOAD_PRESET = 'yadav_auth_preset';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

// ===== Check auth state =====
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Not logged in → redirect to auth page
    window.location.href = 'auth.html';
    return;
  }
  populateDashboard(user);
});

// ===== Populate user data =====
function populateDashboard(user) {
  const displayName = user.displayName || user.email?.split('@')[0] || 'User';
  const email = user.email;
  const photoURL = user.photoURL;

  document.getElementById('profileName').textContent = `Welcome, ${displayName}`;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('editName').value = displayName;
  document.getElementById('editEmail').value = email;

  const img = document.getElementById('profileImg');
  const initials = document.getElementById('initialsDisplay');

  if (photoURL) {
    img.src = photoURL;
    img.style.display = 'block';
    initials.style.display = 'none';
  } else {
    img.style.display = 'none';
    initials.textContent = getInitials(displayName);
    initials.style.display = 'flex';
  }
}

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (name[0] || 'U').toUpperCase();
}

// ===== Edit profile panel toggle =====
document.getElementById('toggleEditBtn').addEventListener('click', () => {
  document.getElementById('editPanel').classList.toggle('active');
});

// ===== Save name changes =====
document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  const newName = document.getElementById('editName').value.trim();
  if (!newName) return;

  try {
    // Update Firebase profile
    await updateProfile(auth.currentUser, { displayName: newName });
    // Refresh UI
    populateDashboard(auth.currentUser);
    document.getElementById('editPanel').classList.remove('active');
    showMessage('photoUploadMsg', 'Name updated successfully.', 'success');
  } catch (error) {
    showMessage('photoUploadMsg', error.message, 'error');
  }
});

// ===== Profile photo upload (Cloudinary) =====
const photoInput = document.getElementById('photoInput');
photoInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show uploading state
  showMessage('photoUploadMsg', 'Uploading photo...', 'info');

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    const photoURL = data.secure_url;

    // Update Firebase user photo
    await updateProfile(auth.currentUser, { photoURL });
    populateDashboard(auth.currentUser);
    showMessage('photoUploadMsg', 'Profile photo updated successfully.', 'success');
  } catch (error) {
    showMessage('photoUploadMsg', 'Failed to upload photo. Please try again.', 'error');
  } finally {
    photoInput.value = ''; // clear file input
  }
});

// Helper to show messages inside the edit panel
function showMessage(elementId, message, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const className = type === 'success' ? 'success-msg' : type === 'error' ? 'error-msg' : 'info-msg';
  el.innerHTML = `<div class="${className}">${message}</div>`;
}

// ===== Logout modal =====
const logoutBtn = document.getElementById('logoutBtn');
const logoutModal = document.getElementById('logoutModal');
const cancelLogout = document.getElementById('cancelLogout');
const confirmLogout = document.getElementById('confirmLogout');

logoutBtn.addEventListener('click', () => logoutModal.classList.add('active'));
cancelLogout.addEventListener('click', () => logoutModal.classList.remove('active'));
confirmLogout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    // Redirect handled by onAuthStateChanged (user becomes null)
  } catch (error) {
    alert('Logout failed: ' + error.message);
  }
});
// Close modal when clicking outside
logoutModal.addEventListener('click', (e) => {
  if (e.target === logoutModal) logoutModal.classList.remove('active');
});

// ===== Menu panels (Settings, Change Password, Help) =====
const menuButtons = document.querySelectorAll('.menu-option');
const optionPanels = document.querySelectorAll('.option-panel');

function hideAllPanels() {
  optionPanels.forEach(p => p.classList.remove('active'));
}

menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const panelId = btn.getAttribute('data-panel');
    const target = document.getElementById(panelId);
    if (target) {
      if (target.classList.contains('active')) {
        target.classList.remove('active');
      } else {
        hideAllPanels();
        target.classList.add('active');
      }
    }
  });
});

// Add an "info" style message (if needed)
const style = document.createElement('style');
style.textContent = '.info-msg { font-size: 0.85rem; color: #1a3a6b; background: #e8f0fe; border-left: 3px solid #1a3a6b; padding: 10px 14px; border-radius: 4px; margin-top: 8px; }';
document.head.appendChild(style);
