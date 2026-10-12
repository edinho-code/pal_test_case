const key = 'pal-case-leads-v1';
const leadForm = document.querySelector('#lead-form');
const outcomeForm = document.querySelector('#outcome-form');
const notice = document.querySelector('#notice');
let leads = [];
let selectedId = null;
try {
  const stored = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(stored) || stored.some(x => !x || typeof x.id !== 'string' || ['name','email','company','status','summary','nextStep'].some(k => typeof x[k] !== 'string'))) throw new Error('Invalid data format');
  const legacyStatuses = { '\u004eovo': 'New', 'Em conversa': 'In conversation', 'Qualificado': 'Qualified', 'Acompanhar': 'Follow up' };
  leads = stored.map(lead => ({ ...lead, status: legacyStatuses[lead.status] || lead.status }));
} catch { notice.textContent = 'Local records could not be restored. You can add new leads.'; }
function persist(next) {
  try { localStorage.setItem(key, JSON.stringify(next)); leads = next; return true; }
  catch { notice.textContent = 'Unable to save. Check that your browser allows local storage.'; return false; }
}
function render() {
  const query = document.querySelector('#search').value.toLocaleLowerCase('en-US');
  const filtered = leads.filter(x => [x.name,x.email,x.company].join(' ').toLocaleLowerCase('en-US').includes(query));
  const body = document.querySelector('#leads'); body.replaceChildren();
  document.querySelector('#count').textContent = `${leads.length} records`;
  document.querySelector('#empty').hidden = filtered.length > 0;
  for (const lead of filtered) {
    const row = document.createElement('tr');
    if (lead.id === selectedId) row.className = 'selected';
    const contact = document.createElement('td'); contact.textContent = lead.name;
    const email = document.createElement('small'); email.textContent = lead.email; contact.append(email); row.append(contact);
    for (const value of [lead.company || '—', lead.status]) { const td = document.createElement('td'); td.textContent = value; row.append(td); }
    const cell = document.createElement('td'); const button = document.createElement('button');
    button.textContent = 'Open'; button.setAttribute('aria-label', `Open ${lead.name}`);
    button.onclick = () => selectLead(lead.id); cell.append(button); row.append(cell); body.append(row);
  }
}
function selectLead(id) {
  const lead = leads.find(x => x.id === id); if (!lead) return;
  selectedId = id; outcomeForm.hidden = false;
  document.querySelector('#selection').textContent = `${lead.name} · ${lead.company || lead.email}`;
  for (const field of ['status','summary','nextStep']) outcomeForm.elements[field].value = lead[field];
  render();
}
leadForm.onsubmit = event => {
  event.preventDefault(); const data = new FormData(leadForm);
  const name = data.get('name').trim(); const email = data.get('email').trim();
  if (!name || !email) { notice.textContent = 'Enter a name and email.'; return; }
  const lead = {id:crypto.randomUUID(),name,email,company:data.get('company').trim(),status:'New',summary:'',nextStep:''};
  if (!persist([...leads,lead])) return;
  leadForm.reset(); selectLead(lead.id); notice.textContent = 'Lead added.';
};
outcomeForm.onsubmit = event => {
  event.preventDefault(); if (!selectedId) return;
  const data = new FormData(outcomeForm);
  const next = leads.map(x => x.id === selectedId ? {...x,status:data.get('status'),summary:data.get('summary').trim(),nextStep:data.get('nextStep').trim()} : x);
  if (persist(next)) { render(); notice.textContent = 'Outcome saved in this browser.'; }
};
document.querySelector('#search').oninput = render;
render();
