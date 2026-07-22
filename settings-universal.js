// Connects the existing Settings panel (language/theme) to the universal status container.
document.addEventListener('DOMContentLoaded', () => {
  const saveBtn = document.getElementById('saveSettingsBtn');
  const settingsMsg = document.getElementById('settingsMsg');
  const universalStatus = document.getElementById('universalStatus');

  if (!saveBtn || !settingsMsg || !universalStatus) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        const text = settingsMsg.textContent.trim();
        if (text) {
          universalStatus.style.display = 'block';
          universalStatus.textContent = text;
          universalStatus.className = 'status-message success';
          setTimeout(() => { universalStatus.style.display = 'none'; }, 5000);
        }
      }
    });
  });

  observer.observe(settingsMsg, { childList: true, subtree: true, characterData: true });
});
