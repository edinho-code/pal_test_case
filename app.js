const key = 'pal-case-leads-v1';
const leadForm = document.querySelector('#lead-form');
const outcomeForm = document.querySelector('#outcome-form');
const notice = document.querySelector('#notice');
let leads = [];
let selectedId = null;
try {
  const stored = JSON.parse(localStorage.getItem(key) || '[]');
  if (!Array.isArray(stored) || stored.some(x => !x || typeof x.id !== 'string' || ['name','email','company','status','summary','nextStep'].some(k => typeof x[k] !== 'string'))) throw new Error('Formato inválido');
  leads = stored;
} catch { notice.textContent = 'Não foi possível recuperar os dados locais. Novos registros podem ser cadastrados.'; }
function persist(next) {
  try { localStorage.setItem(key, JSON.stringify(next)); leads = next; return true; }
  catch { notice.textContent = 'Não foi possível salvar. Verifique se o navegador permite armazenamento local.'; return false; }
}
function render() {
  const query = document.querySelector('#search').value.toLocaleLowerCase('pt-BR');
  const filtered = leads.filter(x => [x.name,x.email,x.company].join(' ').toLocaleLowerCase('pt-BR').includes(query));
  const body = document.querySelector('#leads'); body.replaceChildren();
  document.querySelector('#count').textContent = `${leads.length} registros`;
  document.querySelector('#empty').hidden = filtered.length > 0;
  for (const lead of filtered) {
    const row = document.createElement('tr');
    if (lead.id === selectedId) row.className = 'selected';
    const contact = document.createElement('td'); contact.textContent = lead.name;
    const email = document.createElement('small'); email.textContent = lead.email; contact.append(email); row.append(contact);
    for (const value of [lead.company || '—', lead.status]) { const td = document.createElement('td'); td.textContent = value; row.append(td); }
    const cell = document.createElement('td'); const button = document.createElement('button');
    button.textContent = 'Abrir'; button.setAttribute('aria-label', `Abrir ${lead.name}`);
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
  if (!name || !email) { notice.textContent = 'Preencha nome e email.'; return; }
  const lead = {id:crypto.randomUUID(),name,email,company:data.get('company').trim(),status:'Novo',summary:'',nextStep:''};
  if (!persist([...leads,lead])) return;
  leadForm.reset(); selectLead(lead.id); notice.textContent = 'Lead adicionado.';
};
outcomeForm.onsubmit = event => {
  event.preventDefault(); if (!selectedId) return;
  const data = new FormData(outcomeForm);
  const next = leads.map(x => x.id === selectedId ? {...x,status:data.get('status'),summary:data.get('summary').trim(),nextStep:data.get('nextStep').trim()} : x);
  if (persist(next)) { render(); notice.textContent = 'Resultado salvo neste navegador.'; }
};
document.querySelector('#search').oninput = render;
render();
