// ==========================================================================
// CAMPUSFIX — COMPLAINTS DATA & MODAL ACTIONS
// ==========================================================================

// Seed dataset
const seed = [
  {id:'CF-1048',title:'Water leak near the library',category:'Plumbing',building:'Central Library',room:'Ground floor',priority:'High',status:'In Progress',owner:'Alex Morgan',assignee:'Dave Miller (Facilities)',created:'Today, 9:42 AM',description:'Water leaking from ceiling near east entrance. Risk of slippery tiles.'},
  {id:'CF-1047',title:'Projector not turning on',category:'Classroom equipment',building:'Engineering Block',room:'Room 302',priority:'Medium',status:'Assigned',owner:'Jamie Lee',assignee:'IT Support',created:'Today, 8:15 AM',description:'Projector has no power even after checking main circuit switch.'},
  {id:'CF-1046',title:'Broken lights in hallway',category:'Electrical',building:'Arts Building',room:'2nd floor',priority:'Low',status:'Submitted',owner:'Alex Morgan',assignee:'',created:'Yesterday',description:'Two fluorescent lights are flickering continuously and one is completely dark.'},
  {id:'CF-1045',title:'Wi-Fi connection unstable',category:'Internet',building:'Science Block',room:'Lab 1',priority:'Medium',status:'Resolved',owner:'Sam Patel',assignee:'IT Support',created:'Yesterday',description:'Signal keeps dropping every 5 minutes during lab work.'},
  {id:'CF-1044',title:'Overflowing bin outside cafeteria',category:'Cleanliness',building:'Student Centre',room:'Cafeteria',priority:'Low',status:'Closed',owner:'Alex Morgan',assignee:'Housekeeping',created:'Oct 8',description:'Bin needs collection and sanitization around trash area.'},
  {id:'CF-1043',title:'Loose handrail on stairs',category:'Safety',building:'Admin Block',room:'West stairwell',priority:'High',status:'In Progress',owner:'Riya Shah',assignee:'Dave Miller (Facilities)',created:'Oct 8',description:'Handrail is loose between the 2nd and 3rd floor landing.'}
];

let tickets = JSON.parse(localStorage.getItem('campusfix_tickets') || 'null') || seed;

function persist() {
  localStorage.setItem('campusfix_tickets', JSON.stringify(tickets));
}

// --------------------------------------------------------------------------
// Ticket Details Modal
// --------------------------------------------------------------------------
function openTicketDetail(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;

  $('#modalTicketId').textContent = `${t.id} Details`;

  const isStaff = currentUser && currentUser.role === 'Admin';

  $('#ticketDetailBody').innerHTML = `
    <div class="ticket-detail-header">
      <div class="detail-tag-row">
        ${badge(t.status)}
        <span class="priority ${t.priority}">● ${t.priority} Priority</span>
        <span style="font-size:11px;color:#88948d">Category: <b>${esc(t.category)}</b></span>
      </div>
      <h3 style="font:800 18px Manrope;margin:8px 0 4px">${esc(t.title)}</h3>
      <div style="font-size:12px;color:#77857d">Reported by Student <b>${esc(t.owner)}</b> · ${t.created}</div>
    </div>

    <div class="ticket-detail-grid">
      <div class="detail-item">
        <small>Building</small>
        <strong>${esc(t.building)}</strong>
      </div>
      <div class="detail-item">
        <small>Room / Area</small>
        <strong>${esc(t.room)}</strong>
      </div>
      <div class="detail-item">
        <small>Assigned Handler</small>
        <strong>${esc(t.assignee || 'Unassigned')}</strong>
      </div>
      <div class="detail-item">
        <small>Current Status</small>
        <strong>${esc(t.status)}</strong>
      </div>
    </div>

    <div>
      <div style="font-size:11px;font-weight:700;color:#5a685f;margin-bottom:6px">ISSUE DESCRIPTION</div>
      <div class="detail-description">${esc(t.description)}</div>
    </div>

    ${isStaff ? `
      <div class="staff-action-bar">
        <b>🛡️ Administrator Controls</b>
        <div class="action-buttons-flex">
          <button class="btn" style="padding:8px 12px;font-size:12px" onclick="setTicketStatus('${t.id}','In Progress')">
            Mark In Progress
          </button>
          <button class="btn" style="background:#28714d;padding:8px 12px;font-size:12px" onclick="setTicketStatus('${t.id}','Resolved')">
            ✓ Mark Resolved
          </button>
          <button class="btn secondary" style="padding:8px 12px;font-size:12px" onclick="assignToMe('${t.id}')">
            Assign to Admin
          </button>
          <button class="btn secondary" style="color:#b23b3b;padding:8px 12px;font-size:12px" onclick="setTicketStatus('${t.id}','Closed')">
            Close / Archive
          </button>
        </div>
      </div>
    ` : `
      <div style="background:#f4f8f5;border-radius:10px;padding:12px;font-size:12px;color:#526157">
        💡 <b>Student Notice:</b> Your complaint is live in the campus administration queue. Administration will review and resolve this ticket.
      </div>
    `}
  `;

  $('#ticketModal').classList.add('show');
}

function closeTicketModal() {
  $('#ticketModal').classList.remove('show');
}

function setTicketStatus(id, newStatus) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  t.status = newStatus;
  persist();
  render();
  openTicketDetail(id);
  showToast(`${t.id} updated to ${newStatus}`);
}

function assignToMe(id) {
  const t = tickets.find(x => x.id === id);
  if (!t) return;
  const staffName = currentUser ? currentUser.name : 'Campus Administrator';
  t.assignee = staffName + ' (Admin)';
  if (t.status === 'Submitted') t.status = 'In Progress';
  persist();
  render();
  openTicketDetail(id);
  showToast(`${t.id} assigned to ${staffName}`);
}

// --------------------------------------------------------------------------
// Report Complaint Modal
// --------------------------------------------------------------------------
function openReportModal() {
  closeSidebar();
  $('#overlay').classList.add('show');
}

function closeReportModal() {
  $('#overlay').classList.remove('show');
}
