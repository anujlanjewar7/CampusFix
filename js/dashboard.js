// ==========================================================================
// CAMPUSFIX — DASHBOARD RENDERING & ROLE-SPECIFIC INTERFACES
// ==========================================================================

let page = 'overview';
let activeQuickFilter = 'all';

// Sample Campus Facility Notices for Student View
const campusNotices = [
  { icon: '📢', title: 'Library 2nd Floor Cooling', text: 'Air conditioning servicing underway in silent reading zone.' },
  { icon: '💡', title: 'Arts Block Hallway Lights', text: 'All fluorescent replacements completed this morning.' },
  { icon: '📶', title: 'Hostel Block B Wi-Fi', text: 'Network switch upgraded for higher peak bandwidth.' },
  { icon: '🚰', title: 'Science Block Water Cooler', text: 'Filter sanitization scheduled for tomorrow afternoon.' }
];

// Campus Emergency Contacts Directory
const emergencyContacts = [
  {
    id: 'sec',
    icon: '🛡️',
    name: 'Campus Security & Patrol Desk',
    category: 'Safety',
    ext: 'x4400',
    phone: '+91 98765 44000',
    available: '24/7 Active Duty',
    desc: 'Main Gate & Perimeter Patrol. Immediate dispatch for physical threats, theft, trespassers, or night escorts.',
    badgeColor: '#e02424',
    badgeBg: '#fde8e8'
  },
  {
    id: 'med',
    icon: '🚑',
    name: 'Health Center & Ambulance',
    category: 'Medical',
    ext: 'x4402',
    phone: '+91 98765 44002',
    available: '24/7 Rapid Medical',
    desc: 'Campus Medical Dispensary & First Aid. Emergency doctor on call, oxygen support, and immediate ambulance dispatch.',
    badgeColor: '#057a55',
    badgeBg: '#def7ec'
  },
  {
    id: 'fire',
    icon: '🚒',
    name: 'Fire & Electrical Hazards',
    category: 'Hazard',
    ext: 'x4401',
    phone: '+91 98765 44001',
    available: '24/7 Immediate',
    desc: 'Rapid hazard squad for fire alarms, smoke, short-circuits, live wires, and chemical laboratory leaks.',
    badgeColor: '#c27803',
    badgeBg: '#fdf6b2'
  },
  {
    id: 'women',
    icon: '🚨',
    name: "Women's Safety & Anti-Ragging Cell",
    category: 'Safety',
    ext: 'x4409',
    phone: '1800-180-5522',
    available: '24/7 Confidential',
    desc: 'Zero tolerance support hotline. Dedicated female security officers and counselors for immediate assistance.',
    badgeColor: '#9061f9',
    badgeBg: '#f3e8ff'
  },
  {
    id: 'warden',
    icon: '🏢',
    name: 'Chief Hostel Warden Office',
    category: 'Hostel',
    ext: 'x4403',
    phone: '+91 98765 44003',
    available: 'Hostel Block A, B & C',
    desc: 'Hostel safety, urgent room lockouts, medical evacuation from dorms, and emergency overnight assistance.',
    badgeColor: '#3f83f8',
    badgeBg: '#ebf5ff'
  },
  {
    id: 'water',
    icon: '💧',
    name: 'Critical Water & Plumbing Disaster',
    category: 'Utilities',
    ext: 'x4404',
    phone: '+91 98765 44004',
    available: '24/7 Emergency Line',
    desc: 'Main pipe burst, major hostel flooding, sewage overflow, and drinking water facility breakdowns.',
    badgeColor: '#0e9f6e',
    badgeBg: '#def7ec'
  },
  {
    id: 'it',
    icon: '💻',
    name: 'IT Services & Wi-Fi Crisis',
    category: 'Utilities',
    ext: 'x4405',
    phone: '+91 98765 44005',
    available: '8:00 AM - 10:00 PM',
    desc: 'Urgent network, campus portal down during submission deadlines, and computer lab server room emergencies.',
    badgeColor: '#6875f5',
    badgeBg: '#e1effe'
  }
];

let activeEmergencyCat = 'all';

function renderEmergencyContacts() {
  const container = $('#emergencyCardGrid');
  if (!container) return;

  const list = activeEmergencyCat === 'all'
    ? emergencyContacts
    : emergencyContacts.filter(c => c.category === activeEmergencyCat);

  if (!list.length) {
    container.innerHTML = `<div class="empty">No emergency contacts found for this category.</div>`;
    return;
  }

  container.innerHTML = list.map(c => `
    <div class="emergency-card">
      <div class="emergency-card-top">
        <div class="emergency-avatar" style="background:${c.badgeBg};color:${c.badgeColor}">${c.icon}</div>
        <div class="emergency-info">
          <h4>${esc(c.name)}</h4>
          <div class="emergency-sub-info">
            <span class="live-pulse-dot"></span>
            <span class="avail-text">${esc(c.available)}</span>
            <span class="ext-badge">Ext: ${esc(c.ext)}</span>
          </div>
        </div>
      </div>
      <p class="emergency-desc">${esc(c.desc)}</p>
      <div class="emergency-actions">
        <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="btn call-action-btn">
          <span>📞</span> Call ${esc(c.phone)}
        </a>
        <button type="button" class="btn secondary copy-action-btn" onclick="copyEmergencyNumber('${c.phone}', '${esc(c.name)}')">
          <span>📋</span> Copy
        </button>
      </div>
    </div>
  `).join('');
}

function filterEmergencyCategory(cat) {
  activeEmergencyCat = cat;
  $$('#emergencyFilterTabs .e-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ecat === cat);
  });
  renderEmergencyContacts();
}

function openEmergencyModal() {
  closeSidebar();
  const m = $('#emergencyModal');
  if (m) {
    m.classList.add('show');
    renderEmergencyContacts();
  }
}

function closeEmergencyModal() {
  const m = $('#emergencyModal');
  if (m) m.classList.remove('show');
}

function copyEmergencyNumber(num, name) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).then(() => {
      showToast(`Copied ${name} number: ${num}`);
    }).catch(() => {
      showToast(`Emergency number: ${num}`);
    });
  } else {
    showToast(`Emergency number: ${num}`);
  }
}


function applyUserTheme(user) {
  if (!user) return;
  const isAdmin = user.role === 'Admin';

  // Toggle theme class on body
  document.body.classList.toggle('admin-mode', isAdmin);
  document.body.classList.toggle('student-mode', !isAdmin);

  // Profile and header titles
  $('#avatar').textContent = user.avatar || (isAdmin ? 'AD' : 'CU');
  $('#profileName').textContent = user.name || 'Campus Member';
  $('#profileRole').textContent = isAdmin ? 'Operations Administrator' : 'Student Account';
  $('#sidebarRoleName').textContent = isAdmin ? 'Admin Console' : 'Student Portal';
  $('#topRoleLabel').textContent = `${(user.name || 'User').split(' ')[0]} (${isAdmin ? 'Admin' : 'Student'})`;

  // Brand and sidebar subtitles
  const brandSub = $('.brand small');
  if (brandSub) brandSub.textContent = isAdmin ? 'OPERATIONS & DISPATCH' : 'CAMPUS CARE, MADE SIMPLE';

  // Sidebar role pill
  const pill = $('#sidebarRolePill');
  if (pill) {
    pill.className = 'role-badge-pill ' + (isAdmin ? 'admin' : '');
  }
  const topBtn = $('#topRoleBtn');
  if (topBtn) {
    topBtn.className = 'role-switch-badge ' + (isAdmin ? 'admin' : '');
  }

  // Sidebar navigation labels & icons
  const overviewBtn = $('.nav button[data-page="overview"]');
  if (overviewBtn) {
    overviewBtn.innerHTML = `<span class="ico">${isAdmin ? '📊' : '▦'}</span>${isAdmin ? 'Ops Console' : 'Overview'}`;
  }
  const ticketsBtn = $('.nav button[data-page="tickets"]');
  if (ticketsBtn) {
    ticketsBtn.innerHTML = `<span class="ico">${isAdmin ? '📥' : '▤'}</span>${isAdmin ? 'All Student Reports' : 'Campus Complaints'}<span class="nav-badge" id="badgeAll">0</span>`;
  }
  const mineBtn = $('#navMineBtn');
  if (mineBtn) {
    mineBtn.innerHTML = `<span class="ico">${isAdmin ? '⚡' : '◷'}</span>${isAdmin ? 'Needs Action' : 'My Complaints'}<span class="nav-badge" id="badgeMine">0</span>`;
  }
  const emergencyNavBtn = $('#emergencyNavBtn');
  if (emergencyNavBtn) {
    emergencyNavBtn.style.display = isAdmin ? 'none' : 'flex';
  }
  const reportNavBtn = $('#reportNav');
  if (reportNavBtn) {
    reportNavBtn.style.display = isAdmin ? 'none' : 'flex';
    reportNavBtn.innerHTML = `<span class="ico">＋</span>Report an Issue`;
  }

  // Mobile Floating Add button
  const mobFabBtn = $('#mobFabBtn');
  if (mobFabBtn) {
    mobFabBtn.style.display = isAdmin ? 'none' : 'grid';
  }

  // Sidebar helpbox text
  const helpbox = $('.helpbox');
  if (helpbox) {
    if (isAdmin) {
      helpbox.innerHTML = `<b>Operations Dispatch</b>Security Duty: <b>x4400</b> · Facilities Director: <b>x4412</b> · Direct Escalation Active.`;
    } else {
      helpbox.innerHTML = `
        <b>Need immediate help?</b>For emergency safety or medical needs, call rapid response 24/7.
        <button type="button" class="helpbox-emergency-btn" onclick="openEmergencyModal()">🚨 View Emergency Contacts</button>
      `;
    }
  }

  // Subheadings and greeting
  const firstName = (user.name || 'User').split(' ')[0];
  const greetings = {
    Student: `Good morning, ${firstName} 👋`,
    Admin: `Operations Control — ${user.name} 🛡️`
  };
  const subheadings = {
    Student: 'Track your submitted issues or report new campus maintenance requests.',
    Admin: 'Real-time student complaint triage, work order assignment & facility dispatch.'
  };
  $('#greeting').textContent = greetings[user.role] || `Welcome, ${user.name}`;
  $('#subheading').textContent = subheadings[user.role] || '';

  // Header action buttons
  const headerActions = $('#headingActionsWrap');
  if (headerActions) {
    if (isAdmin) {
      headerActions.innerHTML = `
        <button class="btn secondary" onclick="exportTicketsCSV()" title="Download complete CSV summary">📥 &nbsp;Export CSV</button>
      `;
    } else {
      headerActions.innerHTML = `
        <button class="btn secondary" style="border-color:#fecaca;color:#dc2626;" onclick="openEmergencyModal()" title="View 24/7 campus emergency helplines">🚨 &nbsp;Emergency Contacts</button>
        <button class="btn" id="reportBtn" onclick="openReportModal()">＋ &nbsp;Report an issue</button>
      `;
    }
  }

  // Welcome / Context Banner
  const bannerSlot = $('#roleBannerSlot');
  if (bannerSlot) {
    if (isAdmin) {
      bannerSlot.innerHTML = `
        <div style="background: linear-gradient(135deg, #f5effc 0%, #faf5ff 100%); border: 1px solid #e0c8f5; border-radius: 14px; padding: 14px 18px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
          <div>
            <b style="color: #551d7c; font-size: 13px;">🛡️ Administrator Operations Center</b>
            <p style="margin: 2px 0 0; font-size: 12px; color: #723b9c;">Review and resolve incoming student complaints. Monitor campus facility health and assign on-duty technicians.</p>
          </div>
          <span style="background: #ede0fa; color: #551d7c; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 20px; white-space: nowrap;">⚡ Triage Live</span>
        </div>
      `;
    } else {
      bannerSlot.innerHTML = `
        <div class="student-welcome-banner">
          <div>
            <b>Campus Facilities Helpdesk</b>
            <p>Notice a broken light, leaky pipe, Wi-Fi fault, or classroom issue? Submit a report for fast repair.</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button class="btn emergency-banner-btn" type="button" onclick="openEmergencyModal()">🚨 Emergency Contacts</button>
            <button class="btn" style="padding: 8px 14px; font-size: 12px; white-space: nowrap;" onclick="openReportModal()">＋ Report Issue</button>
          </div>
        </div>
      `;
    }
  }
}

function setQuickFilter(key) {
  activeQuickFilter = key;
  render();
}

function exportTicketsCSV() {
  const headers = ['Ticket ID', 'Title', 'Category', 'Building', 'Room', 'Priority', 'Status', 'Student Owner', 'Assignee', 'Reported Date'];
  const rows = tickets.map(t => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    `"${(t.building || '').replace(/"/g, '""')}"`,
    `"${(t.room || '').replace(/"/g, '""')}"`,
    t.priority,
    t.status,
    `"${(t.owner || '').replace(/"/g, '""')}"`,
    `"${(t.assignee || '').replace(/"/g, '""')}"`,
    `"${(t.created || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `campusfix_complaints_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Complaints report exported as CSV!');
}

function quickResolveTicket(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  t.status = 'Resolved';
  if (!t.assignee && currentUser) {
    t.assignee = currentUser.name + ' (Admin)';
  }
  persist();
  render();
  showToast(`Ticket ${t.id} marked as Resolved!`);
}

function render() {
  if (!currentUser) return;

  const role = currentUser.role || 'Student';
  const isAdmin = role === 'Admin';
  const mine = page === 'mine';

  // Counts calculation
  const myTotal = tickets.filter(t => t.owner === currentUser.name).length;
  const myInProgress = tickets.filter(t => t.owner === currentUser.name && t.status === 'In Progress').length;
  const myResolved = tickets.filter(t => t.owner === currentUser.name && ['Resolved', 'Closed'].includes(t.status)).length;
  const adminPending = tickets.filter(t => !['Resolved', 'Closed', 'Rejected'].includes(t.status)).length;

  const totalOpen = tickets.filter(t => !['Resolved', 'Closed', 'Rejected'].includes(t.status)).length;
  const totalInProgress = tickets.filter(t => t.status === 'In Progress').length;
  const totalResolved = tickets.filter(t => ['Resolved', 'Closed'].includes(t.status)).length;
  const totalHigh = tickets.filter(t => t.priority === 'High' && !['Resolved', 'Closed'].includes(t.status)).length;

  // Badges count
  $('#badgeAll').textContent = tickets.length;
  if ($('#badgeMine')) $('#badgeMine').textContent = isAdmin ? adminPending : myTotal;

  // Breadcrumbs & List Title
  $('#crumb').textContent = page === 'overview' ? (isAdmin ? 'Operations Console' : 'Overview') : mine ? (isAdmin ? 'Action Queue' : 'My Complaints') : (isAdmin ? 'All Student Reports' : 'Campus Complaints');
  $('#listTitle').textContent = mine ? (isAdmin ? 'Pending student complaints' : 'My submitted complaints') : page === 'tickets' ? (isAdmin ? 'All student complaints' : 'All campus complaints') : (isAdmin ? 'Live complaints queue' : 'Recent campus complaints');

  // Filter list items
  let visible = tickets.slice();

  // Navigation tab filtering
  if (mine) {
    if (isAdmin) {
      visible = visible.filter(t => !['Resolved', 'Closed', 'Rejected'].includes(t.status));
    } else {
      visible = visible.filter(t => t.owner === currentUser.name);
    }
  }

  // Quick Filter Bar filtering
  if (isAdmin) {
    if (activeQuickFilter === 'action') {
      visible = visible.filter(t => !['Resolved', 'Closed', 'Rejected'].includes(t.status));
    } else if (activeQuickFilter === 'in_progress') {
      visible = visible.filter(t => t.status === 'In Progress');
    } else if (activeQuickFilter === 'resolved') {
      visible = visible.filter(t => ['Resolved', 'Closed'].includes(t.status));
    } else if (activeQuickFilter === 'high') {
      visible = visible.filter(t => t.priority === 'High');
    }
  } else {
    if (activeQuickFilter === 'my_reports') {
      visible = visible.filter(t => t.owner === currentUser.name);
    } else if (activeQuickFilter === 'in_progress') {
      visible = visible.filter(t => (mine ? t.owner === currentUser.name : true) && t.status === 'In Progress');
    } else if (activeQuickFilter === 'resolved') {
      visible = visible.filter(t => (mine ? t.owner === currentUser.name : true) && ['Resolved', 'Closed'].includes(t.status));
    }
  }

  // Text search
  const query = $('#search').value.toLowerCase().trim();
  const statusFilterVal = $('#statusFilter').value;
  if (query) {
    visible = visible.filter(t => (t.title + t.id + t.building + t.room + t.category + t.priority + (t.owner || '')).toLowerCase().includes(query));
  }
  if (statusFilterVal) {
    visible = visible.filter(t => t.status === statusFilterVal);
  }

  // Limit on overview for students
  if (page === 'overview' && !isAdmin && activeQuickFilter === 'all' && !query && !statusFilterVal) {
    visible = visible.slice(0, 5);
  }

  $('#listCount').textContent = visible.length + ' shown';

  // Render Role-specific Quick Filter Pills
  const filterBar = $('#quickFilterBar');
  if (filterBar) {
    if (isAdmin) {
      filterBar.innerHTML = `
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'all' ? 'active' : ''}" onclick="setQuickFilter('all')">
          All Reports <span class="pill-count">${tickets.length}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'action' ? 'active' : ''}" onclick="setQuickFilter('action')">
          ⚡ Needs Action <span class="pill-count">${adminPending}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'in_progress' ? 'active' : ''}" onclick="setQuickFilter('in_progress')">
          🔧 In Progress <span class="pill-count">${totalInProgress}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'high' ? 'active' : ''}" onclick="setQuickFilter('high')">
          🚩 High Priority <span class="pill-count">${totalHigh}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'resolved' ? 'active' : ''}" onclick="setQuickFilter('resolved')">
          ✓ Resolved <span class="pill-count">${totalResolved}</span>
        </button>
      `;
    } else {
      filterBar.innerHTML = `
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'all' ? 'active' : ''}" onclick="setQuickFilter('all')">
          All Campus Issues <span class="pill-count">${tickets.length}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'my_reports' ? 'active' : ''}" onclick="setQuickFilter('my_reports')">
          📂 My Reports <span class="pill-count">${myTotal}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'in_progress' ? 'active' : ''}" onclick="setQuickFilter('in_progress')">
          🔧 Under Repair <span class="pill-count">${myInProgress}</span>
        </button>
        <button type="button" class="quick-filter-pill ${activeQuickFilter === 'resolved' ? 'active' : ''}" onclick="setQuickFilter('resolved')">
          ✓ Solved for Me <span class="pill-count">${myResolved}</span>
        </button>
      `;
    }
  }

  // Render Table Head
  const tableHead = $('#tableHead');
  if (tableHead) {
    if (isAdmin) {
      tableHead.innerHTML = `
        <tr>
          <th>Issue & Student</th>
          <th>Location</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Assigned Handler</th>
          <th style="text-align: right;">Quick Action</th>
        </tr>
      `;
    } else {
      tableHead.innerHTML = `
        <tr>
          <th>Issue</th>
          <th>Location</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Reported</th>
        </tr>
      `;
    }
  }

  // Render Table Rows
  if (isAdmin) {
    $('#ticketRows').innerHTML = visible.length ? visible.map(t => `
      <tr data-id="${t.id}" title="Click to view full ticket details and controls">
        <td>
          <div class="issue">${esc(t.title)}</div>
          <div class="ticketid">
            ${t.id} · ${esc(t.category)} · <span class="student-tag">👤 Student: <b>${esc(t.owner || 'Student')}</b></span>
          </div>
        </td>
        <td class="loc">${esc(t.building)}<br><span style="color:#9ba49e">${esc(t.room)}</span></td>
        <td><span class="priority ${t.priority}">● ${t.priority}</span></td>
        <td>${badge(t.status)}</td>
        <td style="font-size:12px;color:#556259;"><b>${esc(t.assignee || 'Unassigned')}</b></td>
        <td style="text-align: right;" onclick="event.stopPropagation()">
          <div style="display:inline-flex;gap:5px;align-items:center;">
            ${t.status === 'Resolved' || t.status === 'Closed' ? `
              <span style="font-size:11px;color:#15803d;font-weight:700;padding-right:6px;">✓ Resolved</span>
            ` : `
              <button class="row-action-btn resolve-quick" onclick="quickResolveTicket('${t.id}')">✓ Resolve</button>
            `}
            <button class="row-action-btn" onclick="openTicketDetail('${t.id}')">Manage</button>
          </div>
        </td>
      </tr>
    `).join('') : '<tr><td colspan="6" class="empty">No student complaints match this filter.</td></tr>';
  } else {
    $('#ticketRows').innerHTML = visible.length ? visible.map(t => `
      <tr data-id="${t.id}" title="Click to view details">
        <td>
          <div class="issue">
            ${t.owner === currentUser.name ? `<span style="background:#e7f3eb;color:#186b4b;font-size:10px;font-weight:700;padding:1px 6px;border-radius:4px;margin-right:4px;">★ MY TICKET</span>` : ''}
            ${esc(t.title)}
          </div>
          <div class="ticketid">${t.id} · ${esc(t.category)}</div>
        </td>
        <td class="loc">${esc(t.building)}<br><span style="color:#9ba49e">${esc(t.room)}</span></td>
        <td><span class="priority ${t.priority}">● ${t.priority}</span></td>
        <td>${badge(t.status)}</td>
        <td style="color:#89948e">${t.created}</td>
      </tr>
    `).join('') : '<tr><td colspan="5" class="empty">No complaints match your current filter.</td></tr>';
  }

  // Row click to detail modal
  $('#ticketRows').querySelectorAll('tr[data-id]').forEach(tr => {
    tr.onclick = () => openTicketDetail(tr.dataset.id);
  });

  // Render Stats Cards based on Role
  if (isAdmin) {
    $('#stats').innerHTML = [
      ['Total Student Reports', tickets.length, 'All campus tickets', '📥'],
      ['Pending Triage', totalOpen, 'Needs staff dispatch', '⚡'],
      ['Work in Progress', totalInProgress, 'Technicians assigned', '🔧'],
      ['High Priority Alert', totalHigh, 'Immediate care required', '🚩']
    ].map(x => `
      <div class="stat">
        <div class="stat-top">${x[0]}<span class="stat-icon">${x[3]}</span></div>
        <div class="stat-num">${x[1]}</div>
        <div class="stat-foot">${x[2]}</div>
      </div>
    `).join('');
  } else {
    $('#stats').innerHTML = [
      ['My Submissions', myTotal, 'Reported by you', '📝'],
      ['Under Active Repair', myInProgress, 'Technicians working', '🔧'],
      ['Resolved for You', myResolved, 'Successfully completed', '✓'],
      ['Campus Open Issues', totalOpen, 'Total active campus-wide', '◷']
    ].map(x => `
      <div class="stat">
        <div class="stat-top">${x[0]}<span class="stat-icon">${x[3]}</span></div>
        <div class="stat-num">${x[1]}</div>
        <div class="stat-foot">${x[2]}</div>
      </div>
    `).join('');
  }

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

  // Right Widgets Customization for Admin vs Student
  const updatesPanelTitle = $('#updatesPanelTitle');
  const updatesPanelSubtitle = $('#updatesPanelSubtitle');
  const updatesContent = $('#updatesContent');

  if (isAdmin) {
    if (updatesPanelTitle) updatesPanelTitle.textContent = 'Operations Activity';
    if (updatesPanelSubtitle) updatesPanelSubtitle.textContent = 'Live audit stream';
    if (updatesContent) {
      updatesContent.innerHTML = `<div class="activity">${tickets.slice(0, 4).map(t => `
        <div class="activity-row">
          <i class="dot"></i>
          <div>
            <b>${esc(t.title)}</b> ${t.status === 'Resolved' ? 'was marked resolved' : `is ${t.status.toLowerCase()}`}
            <small>${t.id} · Student: ${esc(t.owner)} · ${t.created}</small>
          </div>
        </div>
      `).join('')}</div>`;
    }
  } else {
    if (updatesPanelTitle) updatesPanelTitle.textContent = 'Campus Notices & Help';
    if (updatesPanelSubtitle) updatesPanelSubtitle.textContent = 'Emergency helplines & schedules';
    if (updatesContent) {
      updatesContent.innerHTML = `
        <div class="quick-emergency-widget">
          <div class="q-emer-head">
            <span class="q-emer-badge">🚨 24/7 RAPID HELPLINES</span>
            <button type="button" class="q-emer-viewall" onclick="openEmergencyModal()">All Contacts (7) →</button>
          </div>
          <div class="q-emer-row">
            <div class="q-emer-item">
              <span class="q-emer-ico">🛡️</span>
              <div class="q-emer-text">
                <b>Security Desk</b>
                <small>Ext: x4400</small>
              </div>
              <a href="tel:+919876544000" class="q-emer-call" title="Call Campus Security">Call</a>
            </div>
            <div class="q-emer-item">
              <span class="q-emer-ico">🚑</span>
              <div class="q-emer-text">
                <b>Ambulance</b>
                <small>Ext: x4402</small>
              </div>
              <a href="tel:+919876544002" class="q-emer-call" title="Call Health Center">Call</a>
            </div>
          </div>
        </div>

        <div class="notice-card-list">
          ${campusNotices.map(n => `
            <div class="notice-card">
              <div class="notice-icon">${n.icon}</div>
              <div class="notice-details">
                <strong>${n.title}</strong>
                <p>${n.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
}

// --------------------------------------------------------------------------
// Navigation & Sidebar
// --------------------------------------------------------------------------
function switchPage(p) {
  page = p;
  activeQuickFilter = 'all';
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
