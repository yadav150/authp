// import auth instance from existing firebase.js (NO CHANGES to that file)
import { auth } from './firebase.js';

// import the needed functions directly from the CDN
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const updateBtn = document.getElementById('updatePasswordBtn');
const msgDiv = document.getElementById('passwordChangeMsg');
const universalStatus = document.getElementById('universalStatus');

function showMsg(element, message, type) {
  const className = type === 'success' ? 'success-msg' : 'error-msg';
  element.innerHTML = `<div class="${className}">${message}</div>`;
  if (universalStatus) {
    universalStatus.style.display = 'block';
    universalStatus.textContent = message;
    universalStatus.className = `status-message ${type}`;
    setTimeout(() => { universalStatus.style.display = 'none'; }, 5000);
  }
}

updateBtn.addEventListener('click', async () => {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showMsg(msgDiv, 'All fields are required.', 'error');
    return;
  }
  if (newPassword.length < 6) {
    showMsg(msgDiv, 'New password must be at least 6 characters.', 'error');
    return;
  }
  if (newPassword !== confirmPassword) {
    showMsg(msgDiv, 'New passwords do not match.', 'error');
    return;
  }

  updateBtn.disabled = true;
  updateBtn.textContent = 'Updating…';

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    showMsg(msgDiv, 'Password changed successfully.', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  } catch (error) {
    showMsg(msgDiv, error.message, 'error');
  } finally {
    updateBtn.disabled = false;
    updateBtn.textContent = 'Update Password';
  }
});
