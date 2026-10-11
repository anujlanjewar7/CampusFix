// ==========================================================================
// CAMPUSFIX — UTILITIES & HELPERS
// ==========================================================================

// DOM selector shortcuts
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// HTML escaping helper to prevent XSS
function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// Status badge pill generator
function badge(s) {
  return `<span class="status s-${s.replace(/\s+/g, '')}">${s}</span>`;
}

// Global Toast message notification
let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
