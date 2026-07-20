/* ============================================================
   Notification – Universal Notification System (Singleton)
   Replaces browser alerts. Uses notification.css styles.
   ============================================================ */

import { debounce } from './utils.js';

class NotificationSystem {
  constructor() {
    // Singleton enforcement
    if (NotificationSystem._instance) {
      return NotificationSystem._instance;
    }
    NotificationSystem._instance = this;

    this.container = null;
    this.activeNotifications = [];
    this.defaultDuration = 5000; // ms before auto-dismiss (0 = no auto-dismiss)
    this.maxNotifications = 5;   // max visible at once

    this._ensureContainer();
  }

  /**
   * Create or retrieve the notification container element.
   */
  _ensureContainer() {
    if (this.container && document.body.contains(this.container)) return;

    // Check if already in DOM (from component template)
    let container = document.getElementById('notificationContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationContainer';
      container.className = 'notification-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'false');
      document.body.appendChild(container);
    }
    this.container = container;
  }

  /**
   * Create a notification element.
   * @param {string} message - primary message
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {string} [description] - optional secondary text
   * @param {number} [duration] - auto-dismiss in ms (default 5000, 0 = sticky)
   * @returns {HTMLElement}
   */
  _createNotification(message, type = 'info', description = '', duration = this.defaultDuration) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.setAttribute('role', 'alert');

    // Icon
    const icon = this._getIconSVG(type);
    const iconEl = document.createElement('div');
    iconEl.className = 'notification__icon';
    iconEl.innerHTML = icon;

    // Content
    const content = document.createElement('div');
    content.className = 'notification__content';
    const messageEl = document.createElement('div');
    messageEl.className = 'notification__message';
    messageEl.textContent = message;
    content.appendChild(messageEl);

    if (description) {
      const descEl = document.createElement('div');
      descEl.className = 'notification__description';
      descEl.textContent = description;
      content.appendChild(descEl);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification__close';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.innerHTML = this._getCloseSVG();
    closeBtn.addEventListener('click', () => this._dismiss(notification));

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'notification__progress';

    notification.appendChild(iconEl);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    notification.appendChild(progressBar);

    return notification;
  }

  /**
   * Show a notification.
   * @param {string} message
   * @param {string} [type='info'] - 'success', 'error', 'warning', 'info'
   * @param {Object} [options]
   * @param {string} [options.description]
   * @param {number} [options.duration=5000] - ms, 0 for sticky
   */
  show(message, type = 'info', options = {}) {
    const { description = '', duration = this.defaultDuration } = options;

    // Limit notifications
    if (this.activeNotifications.length >= this.maxNotifications) {
      const oldest = this.activeNotifications.shift();
      this._removeNotification(oldest, true);
    }

    this._ensureContainer();
    const notification = this._createNotification(message, type, description, duration);
    this.container.appendChild(notification);
    this.activeNotifications.push(notification);

    // Trigger animation (next frame)
    requestAnimationFrame(() => {
      notification.classList.add('notification--visible');
    });

    // Auto-dismiss
    if (duration > 0) {
      this._startProgressBar(notification, duration);
      notification._dismissTimer = setTimeout(() => {
        this._dismiss(notification);
      }, duration);
    }

    return notification;
  }

  /**
   * Shortcut methods for each type.
   */
  success(message, description = '', duration) {
    return this.show(message, 'success', { description, duration });
  }
  error(message, description = '', duration) {
    return this.show(message, 'error', { description, duration });
  }
  warning(message, description = '', duration) {
    return this.show(message, 'warning', { description, duration });
  }
  info(message, description = '', duration) {
    return this.show(message, 'info', { description, duration });
  }

  /**
   * Dismiss a specific notification (with animation).
   * @param {HTMLElement} notification
   */
  _dismiss(notification) {
    if (!notification || notification.classList.contains('notification--hiding')) return;

    clearTimeout(notification._dismissTimer);
    notification.classList.remove('notification--visible');
    notification.classList.add('notification--hiding');

    const onTransitionEnd = () => {
      this._removeNotification(notification, false);
      notification.removeEventListener('transitionend', onTransitionEnd);
    };
    notification.addEventListener('transitionend', onTransitionEnd);

    // Fallback in case transitionend doesn't fire
    setTimeout(() => {
      if (notification.parentNode) {
        this._removeNotification(notification, false);
      }
    }, 400);
  }

  /**
   * Remove notification from DOM and active list.
   */
  _removeNotification(notification, immediate) {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    this.activeNotifications = this.activeNotifications.filter(n => n !== notification);
  }

  /**
   * Dismiss all notifications.
   */
  dismissAll() {
    [...this.activeNotifications].forEach(n => this._dismiss(n));
  }

  /**
   * Animate progress bar width for auto-dismiss.
   */
  _startProgressBar(notification, duration) {
    const progressBar = notification.querySelector('.notification__progress');
    if (!progressBar) return;
    progressBar.style.width = '100%';
    progressBar.style.transition = 'none';

    requestAnimationFrame(() => {
      progressBar.style.transition = `width ${duration}ms linear`;
      progressBar.style.width = '0%';
    });
  }

  /**
   * Get SVG icon markup for notification type.
   */
  _getIconSVG(type) {
    const icons = {
      success: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      error: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      warning: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      info: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
    };
    return icons[type] || icons.info;
  }

  /**
   * Get close button SVG.
   */
  _getCloseSVG() {
    return `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/></svg>`;
  }
}

// Export singleton instance
const notification = new NotificationSystem();
export default notification;

// Also export the class for potential extension or testing
export { NotificationSystem };
