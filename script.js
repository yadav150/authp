document.addEventListener('DOMContentLoaded', function () {
  // --- Hamburger menu toggle (unchanged) ---
  var hamburger = document.querySelector('.hamburger');
  var nav = document.getElementById('primary-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
    });
  }

  // --- Auto-inject favicon if missing (path-aware) ---
  if (!document.querySelector("link[rel='icon'], link[rel='shortcut icon']")) {
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    // Use '../favicon.svg' if inside a subfolder (like legal/), else 'favicon.svg'
    link.href = (window.location.pathname.split('/').length > 3) ? '../favicon.svg' : 'favicon.svg';
    document.head.appendChild(link);
  }
});
