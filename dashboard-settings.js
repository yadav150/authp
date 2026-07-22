// Dashboard Settings – Language & Theme
// No existing files are modified.

// Simple translations for dashboard key texts
const translations = {
  en: {
    welcome: 'Welcome,',
    activity: 'Recent Activity',
    loggedIn: 'Logged in',
    accountCreated: 'Account created',
    emailVerified: 'Email verified',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    settings: 'Settings',
    changePassword: 'Change Password',
    helpSupport: 'Help & Support',
    language: 'Language',
    theme: 'Theme',
    saveSettings: 'Save Settings',
    settingsSaved: 'Settings saved successfully.'
  },
  hi: {
    welcome: 'स्वागत है,',
    activity: 'हाल की गतिविधि',
    loggedIn: 'लॉग इन',
    accountCreated: 'खाता बनाया गया',
    emailVerified: 'ईमेल सत्यापित',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    logout: 'लॉग आउट',
    settings: 'सेटिंग्स',
    changePassword: 'पासवर्ड बदलें',
    helpSupport: 'सहायता और समर्थन',
    language: 'भाषा',
    theme: 'थीम',
    saveSettings: 'सेटिंग्स सहेजें',
    settingsSaved: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।'
  },
  as: {
    welcome: 'স্বাগতম,',
    activity: 'শেহতীয়া কাৰ্য্য',
    loggedIn: 'লগ ইন',
    accountCreated: 'একাউণ্ট সৃষ্টি কৰা হৈছে',
    emailVerified: 'ইমেইল নিশ্চিত',
    editProfile: 'প্ৰ’ফাইল সম্পাদনা কৰক',
    logout: 'লগ আউট',
    settings: 'ছেটিংছ',
    changePassword: 'পাছৱৰ্ড সলনি কৰক',
    helpSupport: 'সহায় আৰু সমৰ্থন',
    language: 'ভাষা',
    theme: 'থীম',
    saveSettings: 'ছেটিংছ সংৰক্ষণ কৰক',
    settingsSaved: 'ছেটিংছ সফলভাৱে সংৰক্ষিত হ’ল।'
  }
};

// Apply translations to the current page
function applyLanguage(lang) {
  const t = translations[lang] || translations.en;
  // Update static text elements
  document.querySelector('.activity-card h2').textContent = t.activity;
  const activityItems = document.querySelectorAll('.activity-item span:first-child');
  if (activityItems.length >= 3) {
    activityItems[0].textContent = t.loggedIn;
    activityItems[1].textContent = t.accountCreated;
    activityItems[2].textContent = t.emailVerified;
  }
  document.getElementById('toggleEditBtn').textContent = t.editProfile;
  document.getElementById('logoutBtn').textContent = t.logout;
  document.querySelector('[data-panel="settingsPanel"]').textContent = t.settings;
  document.querySelector('[data-panel="changePasswordPanel"]').textContent = t.changePassword;
  document.querySelector('[data-panel="helpSupportPanel"]').textContent = t.helpSupport;
  document.querySelector('#settingsPanel h2').textContent = t.settings;
  document.querySelector('label[for="langSelect"]').textContent = t.language;
  document.querySelector('label[for="themeSelect"]').textContent = t.theme;
  document.getElementById('saveSettingsBtn').textContent = t.saveSettings;
}

// Apply theme class to body
function applyTheme(theme) {
  document.body.classList.remove('dark-theme', 'grey-theme');
  if (theme === 'dark') document.body.classList.add('dark-theme');
  else if (theme === 'grey') document.body.classList.add('grey-theme');
  // light is default, no class needed
}

// Save and apply settings
function saveSettings() {
  const lang = document.getElementById('langSelect').value;
  const theme = document.getElementById('themeSelect').value;
  localStorage.setItem('dashboard_lang', lang);
  localStorage.setItem('dashboard_theme', theme);
  applyTheme(theme);
  applyLanguage(lang);
  // Show success message
  const msg = document.getElementById('settingsMsg');
  msg.innerHTML = `<div class="success-msg">${translations[lang].settingsSaved}</div>`;
  // Also update universal status if present
  const universal = document.getElementById('universalStatus');
  if (universal) {
    universal.style.display = 'block';
    universal.textContent = translations[lang].settingsSaved;
    universal.className = 'status-message success';
    setTimeout(() => { universal.style.display = 'none'; }, 5000);
  }
}

// Initialise on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('dashboard_lang') || 'en';
  const savedTheme = localStorage.getItem('dashboard_theme') || 'light';
  document.getElementById('langSelect').value = savedLang;
  document.getElementById('themeSelect').value = savedTheme;
  applyTheme(savedTheme);
  applyLanguage(savedLang);

  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
});
