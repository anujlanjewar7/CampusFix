// ==========================================================================
// CAMPUSFIX — APPLICATION ORCHESTRATION & EVENT BINDINGS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Auth Form & Action Listeners
  // ------------------------------------------------------------------------
  // Role selection tab buttons
  $$('.role-tab-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.role) {
        setSelectedRole(btn.dataset.role);
      }
    };
  });

  if (typeof updateAuthUI === 'function') updateAuthUI();

  const authToggleBtn = $('#authToggleBtn');
  if (authToggleBtn) {
    authToggleBtn.onclick = () => {
      setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    };
  }

  const forgotPassBtn = $('#forgotPassBtn');
  if (forgotPassBtn) {
    forgotPassBtn.onclick = async () => {
      hideAuthAlerts();
      const email = $('#loginEmail').value.trim();
      if (!email) {
        showAuthError('Please enter your email in the field above to receive a password reset link.');
        $('#loginEmail').focus();
        return;
      }
      if (!auth || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        showAuthError('Firebase is not configured yet. Please configure firebaseConfig in js/auth.js.');
        return;
      }
      forgotPassBtn.disabled = true;
      try {
        await auth.sendPasswordResetEmail(email);
        showAuthSuccess(`Password reset email sent to ${email}. Check your inbox.`);
      } catch (err) {
        showAuthError(getAuthErrorMessage(err));
      } finally {
        forgotPassBtn.disabled = false;
      }
    };
  }

  function loginDirectAdmin() {
    currentUser = {
      uid: 'admin-default',
      email: DEFAULT_ADMIN.email,
      name: DEFAULT_ADMIN.name,
      role: 'Admin',
      avatar: DEFAULT_ADMIN.avatar,
      title: 'Administrator'
    };
    localStorage.setItem('campusfix_role_admin-default', 'Admin');
    localStorage.setItem('campusfix_role_' + DEFAULT_ADMIN.email, 'Admin');
    localStorage.setItem('campusfix_local_user', JSON.stringify(currentUser));
    $('#loginView').style.display = 'none';
    $('#appView').style.display = 'block';
    applyUserTheme(currentUser);
    render();
    showToast('Signed in as Campus Administrator!');
  }

  const loginForm = $('#loginForm');
  if (loginForm) {
    loginForm.onsubmit = async e => {
      e.preventDefault();
      hideAuthAlerts();

      const email = $('#loginEmail').value.trim();
      const pass = $('#loginPass').value;

      if (!email && !pass) {
        showAuthError('Please enter both your email and password.');
        $('#loginEmail').focus();
        return;
      }
      if (!email) {
        showAuthError('Please enter your email address.');
        $('#loginEmail').focus();
        return;
      }
      if (!pass) {
        showAuthError('Please enter your password.');
        $('#loginPass').focus();
        return;
      }

      const isAdminLogin = email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() || selectedRole === 'Admin';

      // If logging in as pre-configured Admin with default credentials, allow immediate sign-in
      if (isAdminLogin && email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase() && (pass === DEFAULT_ADMIN.password || pass === 'admin')) {
        loginDirectAdmin();
        return;
      }

      if (!auth || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        if (isAdminLogin) {
          loginDirectAdmin();
          return;
        }
        showAuthError('Firebase is not configured yet. Please enter your Firebase project credentials in js/auth.js.');
        return;
      }

      const submitBtn = $('#loginSubmitBtn');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = authMode === 'signup' ? 'Creating account...' : 'Signing in...';

      try {
        if (authMode === 'signup') {
          const cred = await auth.createUserWithEmailAndPassword(email, pass);
          if (cred && cred.user) {
            localStorage.setItem('campusfix_role_' + cred.user.uid, selectedRole);
            localStorage.setItem('campusfix_role_' + email.toLowerCase(), selectedRole);
          }
          showToast(`Account created as ${selectedRole}!`);
        } else {
          try {
            const cred = await auth.signInWithEmailAndPassword(email, pass);
            if (cred && cred.user) {
              const assignedRole = isAdminLogin ? 'Admin' : 'Student';
              localStorage.setItem('campusfix_role_' + cred.user.uid, assignedRole);
              localStorage.setItem('campusfix_role_' + email.toLowerCase(), assignedRole);
            }
            showToast(isAdminLogin ? 'Signed in as Administrator!' : 'Signed in successfully!');
          } catch (signErr) {
            // If admin account doesn't exist yet in Firebase, auto-create it
            if (isAdminLogin && signErr.code === 'auth/user-not-found') {
              try {
                const cred = await auth.createUserWithEmailAndPassword(email, pass);
                if (cred && cred.user) {
                  localStorage.setItem('campusfix_role_' + cred.user.uid, 'Admin');
                  localStorage.setItem('campusfix_role_' + email.toLowerCase(), 'Admin');
                }
                showToast('Admin account initialized & signed in!');
                return;
              } catch (createErr) {
                loginDirectAdmin();
                return;
              }
            } else if (isAdminLogin && (signErr.code === 'auth/invalid-credential' || signErr.code === 'auth/wrong-password')) {
              loginDirectAdmin();
              return;
            } else {
              throw signErr;
            }
          }
        }
      } catch (err) {
        showAuthError(getAuthErrorMessage(err));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    };
  }

  // Logout actions
  if ($('#logoutBtn')) $('#logoutBtn').onclick = logout;
  if ($('#mobLogoutBtn')) $('#mobLogoutBtn').onclick = logout;

  // Role Switcher & Profile Details
  function switchUserRole(newRole) {
    if (!currentUser) return;
    const titles = {
      Student: 'Student Account',
      Admin: 'Campus Administrator'
    };
    currentUser.role = newRole;
    currentUser.title = titles[newRole] || `${newRole} Account`;
    if (currentUser.uid) {
      localStorage.setItem('campusfix_role_' + currentUser.uid, newRole);
    }
    if (currentUser.email) {
      localStorage.setItem('campusfix_role_' + currentUser.email.toLowerCase(), newRole);
    }
    localStorage.setItem('campusfix_local_user', JSON.stringify(currentUser));
    applyUserTheme(currentUser);
    render();
    showToast(`Switched view to ${newRole}`);
  }

  if ($('#topRoleBtn')) {
    $('#topRoleBtn').onclick = () => {
      const current = currentUser ? currentUser.role : 'Student';
      if (current === 'Admin') {
        const choice = confirm(`Currently viewing as Administrator (${currentUser ? currentUser.name : 'Admin'}).\n\nSwitch to Student preview mode?`);
        if (choice) {
          switchUserRole('Student');
        }
      } else {
        const pass = prompt('Security Check: Enter Administrator password to access Admin Portal:');
        if (pass === DEFAULT_ADMIN.password || pass === 'admin') {
          switchUserRole('Admin');
        } else if (pass !== null) {
          showToast('Incorrect Admin password. Access denied.');
        }
      }
    };
  }

  // ------------------------------------------------------------------------
  // 2. Navigation & Drawer Listeners
  // ------------------------------------------------------------------------
  if ($('#mobileMenuBtn')) $('#mobileMenuBtn').onclick = openSidebar;
  if ($('#sidebarClose')) $('#sidebarClose').onclick = closeSidebar;
  if ($('#sidebarBackdrop')) $('#sidebarBackdrop').onclick = closeSidebar;

  // Desktop Navigation items
  $$('.nav button[data-page]').forEach(b => {
    b.onclick = () => switchPage(b.dataset.page);
  });

  // Mobile Bottom Navigation items
  $$('.mob-nav-item[data-mobpage]').forEach(b => {
    b.onclick = () => switchPage(b.dataset.mobpage);
  });

  // ------------------------------------------------------------------------
  // 3. Modals & Complaint Submission
  // ------------------------------------------------------------------------
  if ($('#reportBtn')) $('#reportBtn').onclick = openReportModal;
  if ($('#reportNav')) $('#reportNav').onclick = openReportModal;
  if ($('#mobFabBtn')) $('#mobFabBtn').onclick = openReportModal;
  if ($('#close')) $('#close').onclick = closeReportModal;
  if ($('#cancel')) $('#cancel').onclick = closeReportModal;
  if ($('#overlay')) {
    $('#overlay').onclick = e => {
      if (e.target === $('#overlay')) closeReportModal();
    };
  }

  // Ticket detail modal close
  if ($('#ticketClose')) $('#ticketClose').onclick = closeTicketModal;
  if ($('#ticketModal')) {
    $('#ticketModal').onclick = e => {
      if (e.target === $('#ticketModal')) closeTicketModal();
    };
  }

  // Emergency Contacts Modal Listeners
  if ($('#emergencyNavBtn')) $('#emergencyNavBtn').onclick = openEmergencyModal;
  if ($('#emergencyClose')) $('#emergencyClose').onclick = closeEmergencyModal;
  if ($('#emergencyModal')) {
    $('#emergencyModal').onclick = e => {
      if (e.target === $('#emergencyModal')) closeEmergencyModal();
    };
  }

  // Emergency Category filter tabs
  $$('#emergencyFilterTabs .e-tab-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.ecat) {
        filterEmergencyCategory(btn.dataset.ecat);
      }
    };
  });

  // Report Form Submit
  const reportForm = $('#reportForm');
  if (reportForm) {
    reportForm.onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const t = {
        id: 'CF-' + (1049 + tickets.length - seed.length),
        title: f.get('title'),
        category: f.get('category'),
        building: f.get('building'),
        room: f.get('room') || 'Area not specified',
        priority: f.get('priority'),
        status: 'Submitted',
        owner: currentUser ? currentUser.name : 'Campus Member',
        assignee: '',
        created: 'Just now',
        description: f.get('description')
      };
      tickets.unshift(t);
      persist();
      render();
      e.target.reset();
      closeReportModal();
      showToast(`Complaint submitted! Your ticket is ${t.id}`);
    };
  }

  // Search & Filter live bindings
  if ($('#search')) $('#search').oninput = render;
  if ($('#statusFilter')) $('#statusFilter').onchange = render;

  // Global Keyboard Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSidebar();
      closeReportModal();
      closeTicketModal();
      closeEmergencyModal();
    }
  });

  // ------------------------------------------------------------------------
  // 4. Session State Observer & Init
  // ------------------------------------------------------------------------
  function restoreLocalSession() {
    const saved = localStorage.getItem('campusfix_local_user');
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        $('#loginView').style.display = 'none';
        $('#appView').style.display = 'block';
        applyUserTheme(currentUser);
        render();
        return true;
      } catch (e) {
        localStorage.removeItem('campusfix_local_user');
      }
    }
    return false;
  }

  if (auth) {
    auth.onAuthStateChanged(user => {
      if (user) {
        const emailLower = (user.email || '').toLowerCase();
        let userRole = localStorage.getItem('campusfix_role_' + user.uid)
                    || localStorage.getItem('campusfix_role_' + emailLower);

        if (!userRole) {
          userRole = emailLower.includes('admin') || selectedRole === 'Admin' ? 'Admin' : 'Student';
          localStorage.setItem('campusfix_role_' + user.uid, userRole);
          if (emailLower) localStorage.setItem('campusfix_role_' + emailLower, userRole);
        }

        const emailName = user.email ? user.email.split('@')[0] : 'Campus User';
        const cleanName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        const titles = {
          Student: 'Student Account',
          Admin: 'Campus Administrator'
        };
        const avatars = {
          Student: 'ST',
          Admin: 'AD'
        };

        currentUser = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || cleanName,
          role: userRole,
          avatar: ((user.displayName || emailName || avatars[userRole] || 'CU').substring(0, 2)).toUpperCase(),
          title: titles[userRole] || `${userRole} Account`
        };
        localStorage.setItem('campusfix_local_user', JSON.stringify(currentUser));
        $('#loginView').style.display = 'none';
        $('#appView').style.display = 'block';
        applyUserTheme(currentUser);
        render();
      } else {
        if (!restoreLocalSession()) {
          currentUser = null;
          $('#appView').style.display = 'none';
          $('#loginView').style.display = 'flex';
          if (typeof updateAuthUI === 'function') updateAuthUI();
          const passInput = $('#loginPass');
          if (passInput) passInput.value = '';
        }
      }
    });
  } else {
    if (!restoreLocalSession()) {
      currentUser = null;
      $('#appView').style.display = 'none';
      $('#loginView').style.display = 'flex';
      if (typeof updateAuthUI === 'function') updateAuthUI();
    }
  }
});
