document.addEventListener('DOMContentLoaded', function () {
  // --- Hamburger menu toggle ---
  var hamburger = document.querySelector('.hamburger');
  var nav = document.getElementById('primary-nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var expanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !expanded);
      nav.classList.toggle('open');
    });
  }

  // --- Auto-inject favicon if missing ---
  if (!document.querySelector("link[rel='icon'], link[rel='shortcut icon']")) {
    var link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = 'favicon.svg';
    document.head.appendChild(link);
  }
});
