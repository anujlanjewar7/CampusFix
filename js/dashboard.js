// ==========================================================================
// CAMPUSFIX — DASHBOARD RENDERING & WORKSPACE NAVIGATION
// ==========================================================================

let page = 'overview';

function applyUserTheme(user) {
  if (!user) return;
  $('#avatar').textContent = user.avatar || 'CU';
  $('#profileName').textContent = user.name || 'Campus Member';
  $('#profileRole').textContent = user.title || 'Campus Account';
  $('#sidebarRoleName').textContent = (user.role || 'Campus') + ' Portal';
  $('#topRoleLabel').textContent = `${(user.name || 'User').split(' ')[0]} (${user.role || 'Member'})`;

  // Sidebar and topbar badge color
  const pill = $('#sidebarRolePill');
  if (pill) {
    pill.className = 'role-badge-pill ' + (user.role === 'Admin' ? 'admin' : '');
  }
  const topBtn = $('#topRoleBtn');
  if (topBtn) {
    topBtn.className = 'role-switch-badge ' + (user.role === 'Admin' ? 'admin' : '');
  }

  // Subheadings and greeting
  const firstName = (user.name || 'User').split(' ')[0];
  const greetings = {
    Student: `Good morning, ${firstName} 👋`,
    Admin: `Campus Operations — ${user.name} 🛡️`
  };
  const subheadings = {
    Student: 'Here’s what’s happening around your campus today.',
    Admin: 'Monitor, prioritize, and manage all student complaints campus-wide.'
  };

  $('#greeting').textContent = greetings[user.role] || `Welcome, ${user.name}`;
  $('#subheading').textContent = subheadings[user.role] || '';

  // Update nav title for "Mine" depending on role
  if ($('#navMineBtn')) {
    $('#navMineBtn').innerHTML = `<span class="ico">${user.role === 'Admin' ? '⚡' : '◷'}</span>${user.role === 'Admin' ? 'Action needed' : 'My complaints'}<span class="nav-badge" id="badgeMine">0</span>`;
  }
}

function render() {
  if (!currentUser) return;

  const role = currentUser.role || 'Student';
  const mine = page === 'mine';

  // Badges count: For Student, their own complaints; for Admin, pending/action needed complaints
  const myCount = tickets.filter(t => role === 'Student' ? t.owner === currentUser.name : !['Resolved','Closed','Rejected'].includes(t.status)).length;
  $('#badgeAll').textContent = tickets.length;
  if ($('#badgeMine')) $('#badgeMine').textContent = myCount;

  $('#crumb').textContent = page === 'overview' ? 'Overview' : mine ? (role === 'Admin' ? 'Action needed' : 'My complaints') : 'All complaints';
  $('#listTitle').textContent = mine ? (role === 'Admin' ? 'Pending student complaints' : 'My submitted complaints') : page === 'tickets' ? 'All student complaints' : (role === 'Admin' ? 'All student complaints' : 'Recent complaints');

  let visible = tickets.slice();

  // Role filtering when viewing "mine"
  if (mine) {
    if (role === 'Student') {
      visible = visible.filter(t => t.owner === currentUser.name);
    } else if (role === 'Admin') {
      visible = visible.filter(t => !['Resolved', 'Closed', 'Rejected'].includes(t.status));
    }
  }

  // Text search
  const query = $('#search').value.toLowerCase().trim();
  const status = $('#statusFilter').value;
  if (query) {
    visible = visible.filter(t => (t.title + t.id + t.building + t.room + t.category + t.priority + (t.owner || '')).toLowerCase().includes(query));
  }
  if (status) {
    visible = visible.filter(t => t.status === status);
  }

  // For Student on overview, show recent 5; For Admin, show all student complaints
  if (page === 'overview' && role === 'Student') {
    visible = visible.slice(0, 5);
  }

  $('#listCount').textContent = visible.length + ' shown';

  $('#ticketRows').innerHTML = visible.length ? visible.map(t => `
    <tr data-id="${t.id}" title="Click to view details and update">
      <td>
        <div class="issue">${esc(t.title)}</div>
        <div class="ticketid">
          ${t.id} · ${esc(t.category)} · <span class="student-tag">👤 Student: <b>${esc(t.owner || 'Student')}</b></span>
        </div>
      </td>
      <td class="loc">${esc(t.building)}<br><span style="color:#9ba49e">${esc(t.room)}</span></td>
      <td><span class="priority ${t.priority}">● ${t.priority}</span></td>
      <td>${badge(t.status)}</td>
      <td style="color:#89948e">${t.created}</td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="empty">No complaints match your current filter.</td></tr>';

  $('#ticketRows').querySelectorAll('tr[data-id]').forEach(tr => {
    tr.onclick = () => openTicketDetail(tr.dataset.id);
  });

  // Stats calculation
  const open = tickets.filter(t => !['Resolved','Closed','Rejected'].includes(t.status)).length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => ['Resolved','Closed'].includes(t.status)).length;
  const highPriority = tickets.filter(t => t.priority === 'High' && !['Resolved','Closed'].includes(t.status)).length;

  $('#stats').innerHTML = [
    ['Open requests', open, 'Needs attention', '◷'],
    ['In progress', inProgress, 'Currently handled', '↗'],
    ['Resolved', resolved, 'Successfully done', '✓'],
    ['High priority', highPriority, 'Prompt action needed', '⚑']
  ].map(x => `
    <div class="stat">
      <div class="stat-top">${x[0]}<span class="stat-icon">${x[3]}</span></div>
      <div class="stat-num">${x[1]}</div>
      <div class="stat-foot">${x[2]}</div>
    </div>
  `).join('');

  // Category breakdown chart
  const cats = ['Electrical', 'Plumbing', 'Cleanliness', 'Equipment', 'Internet', 'Safety'];
  let counts = cats.map(c => tickets.filter(t => t.category.toLowerCase().includes(c.toLowerCase()) || (c === 'Equipment' && t.category.toLowerCase().includes('equipment'))).length);
  const max = Math.max(1, ...counts);
  $('#chart').innerHTML = counts.map((n, i) => `
    <div class="barcol">
      <div class="bar ${i === 1 ? 'em' : ''}" style="height:${Math.max(8, n / max * 78)}px" title="${n} reports"></div>
      <div class="barlabel">${['Elec.', 'Plumb.', 'Clean.', 'Equip.', 'Wi-Fi', 'Safety'][i]}</div>
    </div>
  `).join('');
  $('#totalLabel').textContent = tickets.length + ' total reports';

  // Live Activity feed
  $('#activity').innerHTML = tickets.slice(0, 3).map(t => `
    <div class="activity-row">
      <i class="dot"></i>
      <div>
        <b>${esc(t.title)}</b> ${t.status === 'Resolved' ? 'was marked resolved' : `is ${t.status.toLowerCase()}`}
        <small>${t.id} · ${t.created}</small>
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// Navigation & Sidebar
// --------------------------------------------------------------------------
function switchPage(p) {
  page = p;
  $$('.nav button[data-page]').forEach(x => {
    x.classList.toggle('active', x.dataset.page === p);
  });
  $$('.mob-nav-item[data-mobpage]').forEach(x => {
    x.classList.toggle('active', x.dataset.mobpage === p);
  });
  closeSidebar();
  render();
}

function openSidebar() {
  $('#sidebar').classList.add('show');
  $('#sidebarBackdrop').classList.add('show');
}

function closeSidebar() {
  $('#sidebar').classList.remove('show');
  $('#sidebarBackdrop').classList.remove('show');
}
