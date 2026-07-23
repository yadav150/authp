import { auth } from './firebase.js';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const passwordInput = document.getElementById('deletePassword');
const consentCheckbox = document.getElementById('deleteConsent');
const confirmBtn = document.getElementById('confirmDeleteBtn');
const msgDiv = document.getElementById('deleteMsg');

function toggleDeleteButton() {
  confirmBtn.disabled = !(consentCheckbox.checked && passwordInput.value.trim() !== '');
}
consentCheckbox.addEventListener('change', toggleDeleteButton);
passwordInput.addEventListener('input', toggleDeleteButton);

confirmBtn.addEventListener('click', async () => {
  const password = passwordInput.value.trim();
  if (!password) {
    msgDiv.innerHTML = '<div class="error-msg">Please enter your password.</div>';
    return;
  }
  if (!consentCheckbox.checked) {
    msgDiv.innerHTML = '<div class="error-msg">You must tick the consent checkbox.</div>';
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting…';

  try {
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    window.location.replace('index.html');
  } catch (error) {
    msgDiv.innerHTML = `<div class="error-msg">${error.message}</div>`;
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete My Account';
    toggleDeleteButton();
  }
});
