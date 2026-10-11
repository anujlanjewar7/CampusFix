// ==========================================================================
// CAMPUSFIX — FIREBASE AUTHENTICATION (EMAIL & PASSWORD)
// ==========================================================================

// Firebase Web App Configuration
// Replace with your project keys from Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCNn0Ck3aI7jdAqAb8bjqDJ7Hw5CJLjEaY",
  authDomain: "campusfix-50404.firebaseapp.com",
  projectId: "campusfix-50404",
  storageBucket: "campusfix-50404.firebasestorage.app",
  messagingSenderId: "674068781174",
  appId: "1:674068781174:web:e64a5cb8ebe771e044a757"
};

// Initialize Firebase App & Auth
let auth = null;
try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
  } else {
    console.warn('Firebase SDK not loaded.');
  }
} catch (e) {
  console.warn('Firebase initialization error:', e);
}

// Current logged in user object
let currentUser = null;

// Auth form mode ('signin' or 'signup')
let authMode = 'signin';

// Default pre-configured Administrator credentials
const DEFAULT_ADMIN = {
  email: 'admin@campusfix.com',
  password: 'admin123',
  name: 'Campus Administrator',
  role: 'Admin',
  title: 'Administrator',
  avatar: 'AD'
};

// Selected role for login portal ('Student' or 'Admin')
let selectedRole = localStorage.getItem('campusfix_last_selected_role') === 'Admin' ? 'Admin' : 'Student';

function updateAuthUI() {
  const roleTitles = {
    Student: authMode === 'signup' ? 'Create Student Account' : 'CampusFix Login',
    Admin: authMode === 'signup' ? 'Create Admin Account' : 'Admin Portal Login'
  };
  const roleSubtitles = {
    Student: authMode === 'signup' ? 'Sign up with your campus email to report issues' : 'Sign in to report campus issues or track requests',
    Admin: authMode === 'signup' ? 'Register an administrator account for campus operations' : 'Sign in as Administrator to oversee all student complaints'
  };

  const titleEl = $('#authTitle');
  const subEl = $('#loginSubtitle');
  const submitBtn = $('#loginSubmitBtn');

  if (titleEl) titleEl.textContent = roleTitles[selectedRole] || 'CampusFix Login';
  if (subEl) subEl.textContent = roleSubtitles[selectedRole] || 'Sign in to access CampusFix';
  if (submitBtn) {
    if (authMode === 'signup') {
      submitBtn.textContent = selectedRole === 'Admin' ? 'Create Admin Account' : 'Create Account';
    } else {
      submitBtn.textContent = selectedRole === 'Admin' ? 'Sign In as Admin' : 'Sign In';
    }
  }

  // Update active state on role tabs
  $$('.role-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === selectedRole);
  });
}

function setSelectedRole(role) {
  selectedRole = role === 'Admin' ? 'Admin' : 'Student';
  localStorage.setItem('campusfix_last_selected_role', selectedRole);
  hideAuthAlerts();
  updateAuthUI();
}

function hideAuthAlerts() {
  const alertEl = $('#authAlert');
  const successEl = $('#authSuccess');
  if (alertEl) { alertEl.style.display = 'none'; alertEl.textContent = ''; }
  if (successEl) { successEl.style.display = 'none'; successEl.textContent = ''; }
}

function showAuthError(msg) {
  const alertEl = $('#authAlert');
  const successEl = $('#authSuccess');
  if (successEl) successEl.style.display = 'none';
  if (alertEl) {
    alertEl.textContent = msg;
    alertEl.style.display = 'flex';
  }
}

function showAuthSuccess(msg) {
  const alertEl = $('#authAlert');
  const successEl = $('#authSuccess');
  if (alertEl) alertEl.style.display = 'none';
  if (successEl) {
    successEl.textContent = msg;
    successEl.style.display = 'flex';
  }
}

function getAuthErrorMessage(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';
  const code = err.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact campus administration.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Access temporarily locked. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    default:
      return err.message || 'Authentication failed. Please verify your details and try again.';
  }
}

function setAuthMode(mode) {
  authMode = mode;
  hideAuthAlerts();
  if (mode === 'signup') {
    $('#authTogglePrompt').textContent = 'Already have an account?';
    $('#authToggleBtn').textContent = 'Sign in';
    $('#forgotPassWrap').style.display = 'none';
    $('#loginPass').autocomplete = 'new-password';
  } else {
    $('#authTogglePrompt').textContent = "Don't have an account?";
    $('#authToggleBtn').textContent = 'Register';
    $('#forgotPassWrap').style.display = 'flex';
    $('#loginPass').autocomplete = 'current-password';
  }
  updateAuthUI();
}

async function logout() {
  try {
    localStorage.removeItem('campusfix_local_user');
    currentUser = null;
    if (auth && auth.currentUser) {
      await auth.signOut();
    }
    $('#appView').style.display = 'none';
    $('#loginView').style.display = 'flex';
    updateAuthUI();
    showToast('Signed out successfully');
  } catch (err) {
    console.error('Logout error:', err);
    currentUser = null;
    localStorage.removeItem('campusfix_local_user');
    $('#appView').style.display = 'none';
    $('#loginView').style.display = 'flex';
    updateAuthUI();
    showToast('Signed out');
  }
}
