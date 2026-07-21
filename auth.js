(function() {
  const panels = {
    login: document.getElementById('login-panel'),
    signup: document.getElementById('signup-panel'),
    forgot: document.getElementById('forgot-panel')
  };
  const statusDiv = document.getElementById('auth-status');

  // ----- Panel switching with fade -----
  function showPanel(panelId) {
    // Hide all panels with fade
    Object.keys(panels).forEach(id => {
      if (id === panelId) return;
      const panel = panels[id];
      if (panel.style.display !== 'none') {
        panel.classList.add('fade-out');
        panel.addEventListener('transitionend', function handler() {
          panel.removeEventListener('transitionend', handler);
          panel.style.display = 'none';
          panel.classList.remove('fade-out');
        }, { once: true });
      }
    });

    // Show selected panel
    const target = panels[panelId];
    if (target.style.display === 'none') {
      target.style.display = '';
      // Force reflow for transition to work
      void target.offsetWidth;
      target.classList.add('fade-in');
      setTimeout(() => target.classList.remove('fade-in'), 300); // remove after transition
    }
  }

  // Switch links
  document.querySelectorAll('.switch-to-login').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showPanel('login'); });
  });
  document.querySelectorAll('.switch-to-signup').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showPanel('signup'); });
  });
  document.querySelectorAll('.switch-to-forgot').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); showPanel('forgot'); });
  });

  // ----- Status message helper -----
  function showStatus(msg, type = 'info') {
    statusDiv.textContent = msg;
    statusDiv.className = `status-message ${type}`;
    // auto-clear after 6s
    setTimeout(() => { statusDiv.className = 'status-message'; statusDiv.textContent = ''; }, 6000);
  }

  // ----- Form validation & submission (demo only) -----
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function setFieldError(fieldId, hasError) {
    const group = document.getElementById(fieldId).closest('.form-group');
    if (hasError) group.classList.add('error');
    else group.classList.remove('error');
  }

  // Login
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');
    let valid = true;

    if (!validateEmail(email.value)) { setFieldError('login-email', true); valid = false; }
    else setFieldError('login-email', false);

    if (password.value.trim() === '') { setFieldError('login-password', true); valid = false; }
    else setFieldError('login-password', false);

    if (!valid) return;

    // Simulate loading
    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Logging in...';
    showStatus('Logging in... (simulated)', 'info');

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Login';
      showStatus('Login successful! (Firebase not yet integrated)', 'success');
    }, 1200);
  });

  // Sign Up
  document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');
    const confirm = document.getElementById('signup-confirm');
    let valid = true;

    if (name.value.trim() === '') { setFieldError('signup-name', true); valid = false; }
    else setFieldError('signup-name', false);

    if (!validateEmail(email.value)) { setFieldError('signup-email', true); valid = false; }
    else setFieldError('signup-email', false);

    if (password.value.length < 6) { setFieldError('signup-password', true); valid = false; }
    else setFieldError('signup-password', false);

    if (confirm.value !== password.value) { setFieldError('signup-confirm', true); valid = false; }
    else setFieldError('signup-confirm', false);

    if (!valid) return;

    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Creating account...';
    showStatus('Creating your account... (simulated)', 'info');

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Sign Up';
      showStatus('Account created! A verification email will be sent (Firebase not yet integrated).', 'success');
    }, 1200);
  });

  // Forgot Password
  document.getElementById('forgot-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('forgot-email');
    if (!validateEmail(email.value)) { setFieldError('forgot-email', true); return; }
    else setFieldError('forgot-email', false);

    const btn = this.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    showStatus('If an account with that email exists, a reset link will be sent (simulated).', 'info');

    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = 'Send Reset Link';
      showStatus('Reset link sent! (simulated)', 'success');
    }, 1200);
  });

})();
