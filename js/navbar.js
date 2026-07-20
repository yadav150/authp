/* ============================================================
   Navbar – Dynamic Navigation Bar Behavior
   Handles auth state, active links, mobile menu, scroll shadow.
   ============================================================ */

import { onAuthChange } from './auth-service.js';
import { logout } from './auth-service.js';
import notification from './notification.js';
import { getCurrentPage, redirectTo } from './utils.js';

/**
 * Initialize the navbar on all pages.
 * Call once from app.js.
 */
export function initNavbar() {
  highlightActiveLink();
  setupMobileMenu();
  setupScrollShadow();
  bindLogoutButton();
  listenForAuthChanges();
}

/**
 * Highlight the navbar link matching the current page.
 */
function highlightActiveLink() {
  const currentPage = getCurrentPage();
  const links = document.querySelectorAll('.navbar__link[data-page]');

  links.forEach((link) => {
    const page = link.getAttribute('data-page');
    if (page === currentPage) {
      link.classList.add('navbar__link--active');
    } else {
      link.classList.remove('navbar__link--active');
    }
  });
}

/**
 * Toggle mobile menu open/close.
 */
function setupMobileMenu() {
  const toggleBtn = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.navbar__mobile-menu');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('navbar__mobile-menu--open');
    if (isOpen) {
      mobileMenu.classList.remove('navbar__mobile-menu--open');
      toggleBtn.classList.remove('navbar__toggle--open');
    } else {
      mobileMenu.classList.add('navbar__mobile-menu--open');
      toggleBtn.classList.add('navbar__toggle--open');
    }
  });

  // Close mobile menu when a link inside is clicked
  mobileMenu.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      mobileMenu.classList.remove('navbar__mobile-menu--open');
      toggleBtn.classList.remove('navbar__toggle--open');
    });
  });
}

/**
 * Add shadow to navbar when page is scrolled.
 */
function setupScrollShadow() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 10) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial check
  onScroll();
}

/**
 * Bind the logout button(s) in the navbar.
 */
function bindLogoutButton() {
  // Support both desktop and mobile logout buttons
  const logoutBtns = document.querySelectorAll('.navbar__logout-btn');

  logoutBtns.forEach((btn) => {
    // Prevent multiple bindings
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await logout();
        notification.success('Logout successful', 'See you again soon!');
        setTimeout(() => redirectTo('index.html'), 800);
      } catch (error) {
        notification.error('Logout failed', error.message);
      }
    });
  });
}

/**
 * Listen for Firebase auth state and update navbar UI.
 */
function listenForAuthChanges() {
  const userInfoDesktop = document.querySelector('.navbar__user');
  const userInfoMobile = document.querySelector('.navbar__mobile-menu .navbar__user');
  const authLinks = document.querySelectorAll('[data-auth-visible]');
  const unauthLinks = document.querySelectorAll('[data-unauth-visible]');

  onAuthChange((user) => {
    if (user) {
      // User signed in
      if (userInfoDesktop) userInfoDesktop.style.display = 'flex';
      if (userInfoMobile) userInfoMobile.style.display = 'flex';

      authLinks.forEach((el) => (el.style.display = ''));
      unauthLinks.forEach((el) => (el.style.display = 'none'));

      // Update user name and avatar
      const nameEls = document.querySelectorAll('.navbar__user-name');
      const avatarEls = document.querySelectorAll('.navbar__avatar');
      const displayName = user.displayName || 'User';
      const photoURL = user.photoURL || '';

      nameEls.forEach((el) => (el.textContent = displayName));
      avatarEls.forEach((el) => {
        if (photoURL) {
          el.src = photoURL;
          el.alt = displayName;
        }
      });
    } else {
      // User signed out
      if (userInfoDesktop) userInfoDesktop.style.display = 'none';
      if (userInfoMobile) userInfoMobile.style.display = 'none';

      authLinks.forEach((el) => (el.style.display = 'none'));
      unauthLinks.forEach((el) => (el.style.display = ''));
    }
  });
}
