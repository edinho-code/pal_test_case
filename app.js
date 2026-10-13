const storageKey = 'tavus-lifecycle-nba-beta-v3';
const interactionStorageKey = 'tavus-growth-lab-interactions-v1';
let demoAccounts = [];
let nbaConfig = null;
let analyticsConfig = null;
let signalLibrary = null;
let tavusConfig = null;
let accounts = [];
let interactionEvents = [];
let selectedId = 'mosaic';
let participantName = '';
let identifiedAccountId = null;

const body = document.querySelector('#accounts');
const detail = document.querySelector('#account-detail');
const notice = document.querySelector('#notice');

async function initialize() {
  try {
    const [accountResponse, rulesResponse, analyticsResponse, signalResponse] = await Promise.all([
      fetch('./data/demo-accounts.json'),
      fetch('./data/nba-rules.json'),
      fetch('./data/demo-analytics.json'),
      fetch('./data/signal-library.json')
    ]);
    if (!accountResponse.ok || !rulesResponse.ok || !analyticsResponse.ok || !signalResponse.ok) throw new Error('The beta data files could not be loaded.');
    demoAccounts = await accountResponse.json();
    nbaConfig = await rulesResponse.json();
    analyticsConfig = await analyticsResponse.json();
    signalLibrary = await signalResponse.json();
    try {
      const configResponse = await fetch('/api/tavus/config');
      if (configResponse.ok) tavusConfig = await configResponse.json();
    } catch { /* Static preview mode has no backend connection. */ }
    accounts = restoreAccounts();
    interactionEvents = restoreInteractionEvents();
    renderPalEntry();
    renderAccounts();
    renderDetail();
    renderAnalytics();
    renderDemoOutcomes();
    renderSignalLibrary();
  } catch (error) {
    notice.textContent = `${error.message} Run this app from its folder with a local web server.`;
  }
}

function renderPalEntry() {
  const select = document.querySelector('#entry-account');
  const nameInput = document.querySelector('#entry-name');
  const preview = document.querySelector('#entry-case-preview');
  const startButton = document.querySelector('#entry-start');
  const sessionResult = document.querySelector('#entry-session-result');
  const status = document.querySelector('#entry-status');
  if (!select || !nameInput || !preview || !startButton || !sessionResult || !status) return;
  select.innerHTML = '<option value="">Choose a company scenario</option>' + accounts.map(account => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`).join('');
  startButton.textContent = tavusConfig?.testMode ? 'Create no-cost Tavus API test' : 'Start proactive PAL conversation';

  const updatePreview = () => {
    const account = accounts.find(item => item.id === select.value);
    if (!account) {
      preview.hidden = true;
      startButton.disabled = true;
      status.textContent = 'Select a company to preview the signal and next best action.';
      return;
    }
    const recommendation = getRecommendation(account);
    const action = recommendation.rule.next_best_action;
    preview.innerHTML = `<div class="entry-preview-label">WHY THE PAL IS REACHING OUT</div><strong>${escapeHtml(recommendation.rule.behavior.summary)}</strong><div class="entry-preview-action"><span>NEXT BEST ACTION</span><p>${escapeHtml(action.title)}</p></div><small>Scenario: ${escapeHtml(account.name)} · fictional product signals</small>`;
    preview.hidden = false;
    startButton.disabled = !tavusConfig?.configured || !nameInput.value.trim();
    status.textContent = !tavusConfig?.configured
      ? 'Tavus is not configured on this server.'
      : tavusConfig.testMode
        ? 'Test mode is on; the PAL will not join the call.'
        : 'This selected company and signal will be passed to the PAL before it speaks.';
  };

  select.addEventListener('change', () => {
    sessionResult.hidden = true;
    startButton.hidden = false;
    updatePreview();
  });
  nameInput.addEventListener('input', () => {
    sessionResult.hidden = true;
    startButton.hidden = false;
    startButton.disabled = !select.value || !nameInput.value.trim() || !tavusConfig?.configured;
  });
  document.querySelector('#open-dashboard').addEventListener('click', () => {
    const selectedAccountId = select.value;
    if (selectedAccountId) {
      selectedId = selectedAccountId;
      identifiedAccountId = nameInput.value.trim() ? selectedAccountId : null;
      participantName = nameInput.value.trim();
    }
    document.querySelector('#pal-entry').hidden = true;
    document.querySelector('#dashboard-content').hidden = false;
    document.querySelector('#reset-demo').hidden = false;
    renderAccounts();
    renderDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  document.querySelector('#pal-entry-form').addEventListener('submit', async event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const account = accounts.find(item => item.id === select.value);
    if (!account || !tavusConfig?.configured) return;
    const recommendation = getRecommendation(account);
    participantName = nameInput.value.trim();
    selectedId = account.id;
    identifiedAccountId = account.id;
    startButton.disabled = true;
    startButton.textContent = 'Starting your PAL conversation…';
    status.textContent = `Preparing ${account.name}'s case for ${participantName}…`;
    try {
      const response = await fetch('/api/tavus/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, participantName })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create the Tavus conversation.');
      account.lastTavusConversation = result;
      account.activeNbaRuleId = recommendation.rule.rule_id;
      account.activeNbaTrigger = recommendation.rule.behavior.summary;
      account.events.push({ time: 'Just now', name: result.testMode ? 'Tavus API test conversation created; PAL did not join' : 'Live Tavus conversation created', provenance: 'Tavus API response' });
      recordInteraction(account, result.testMode ? 'tavus_api_test_created' : 'tavus_live_conversation_created', { conversation_id: result.conversationId, test_mode: result.testMode });
      persist();
      if (!result.testMode && result.conversationUrl) {
        sessionResult.innerHTML = `<strong>Your ${escapeHtml(account.name)} session is ready.</strong><a class="button button-primary entry-join" href="${escapeHtml(result.conversationUrl)}" target="_blank" rel="noopener noreferrer">Open live PAL session <span>↗</span></a><small>Case context loaded for ${escapeHtml(participantName)} · ${escapeHtml(recommendation.rule.rule_id)}</small>`;
        sessionResult.hidden = false;
        startButton.hidden = true;
        status.textContent = 'The conversation is ready. Use the button above to enter the Tavus room.';
        return;
      }
      status.textContent = `Test created for ${account.name}. The PAL did not join because test mode is enabled.`;
      startButton.textContent = 'Test created';
    } catch (error) {
      status.textContent = error.message;
      startButton.disabled = false;
      startButton.textContent = tavusConfig.testMode ? 'Create no-cost Tavus API test' : 'Start proactive PAL conversation';
    }
  });
}

function renderSignalLibrary() {
  if (!signalLibrary) return;
  const library = document.querySelector('#signal-library-view');
  const cards = signalLibrary.signals.map(signal => `<article class="signal-card">
    <div class="signal-card-head"><div><span class="signal-category">${escapeHtml(signal.category)}</span><h3>${escapeHtml(signal.title)}</h3></div><span class="signal-status ${signal.positive_signal ? 'signal-positive' : 'signal-recovery'}">${signal.positive_signal ? 'Positive / opportunity' : 'Recovery / service'}</span></div>
    <div class="signal-trigger"><span>OBSERVED SIGNAL</span><p>${escapeHtml(signal.trigger)}</p></div>
    <p class="signal-meaning"><strong>What it may mean</strong>${escapeHtml(signal.interpretation)}</p>
    <blockquote class="signal-opener">“${escapeHtml(signal.opener)}”</blockquote>
    <div class="signal-decision-grid"><div><span>NEXT BEST ACTION</span><p>${escapeHtml(signal.next_best_action)}</p></div><div><span>SUCCESS METRIC</span><p>${escapeHtml(signal.success_metric)}</p></div></div>
    <details class="signal-guardrail"><summary>Guardrail</summary><p>${escapeHtml(signal.guardrail)}</p></details>
    <div class="signal-card-foot"><span class="signal-status-label">Proposed signal · needs instrumentation</span><span class="signal-id">${escapeHtml(signal.id)}</span></div>
  </article>`).join('');
  library.innerHTML = `<div class="signal-library-heading"><div><p class="eyebrow">FROM EVENT TO HELPFUL ACTION</p><h2>${escapeHtml(signalLibrary.title)}</h2><p>${escapeHtml(signalLibrary.description)}</p></div><span class="synthetic-badge">${signalLibrary.signals.length} proposed patterns</span></div>
    <div class="signal-principle"><span class="note-icon">↗</span><p><strong>Proactive should feel helpful, not like surveillance.</strong> Name only a reliable event, ask what it means to the user, then offer one relevant action. A signal starts a conversation; it does not decide what the user wants.</p></div>
    <div class="signal-card-grid">${cards}</div>`;
}

function setWorkspaceTab(tab) {
  const showSignals = tab === 'signals';
  document.querySelector('#accounts-view').hidden = showSignals;
  document.querySelector('#signal-library-view').hidden = !showSignals;
  document.querySelector('#analytics-dashboard').hidden = showSignals;
  for (const [id, active] of [['tab-accounts', !showSignals], ['tab-signals', showSignals]]) {
    const button = document.querySelector(`#${id}`);
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  }
}

function restoreAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved) && saved.length === demoAccounts.length && saved.every(item => demoAccounts.some(seed => seed.id === item.id))) return saved;
  } catch { /* Use the fictional seed cohort when local storage is unavailable or invalid. */ }
  return structuredClone(demoAccounts);
}

function restoreInteractionEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(interactionStorageKey));
    if (Array.isArray(saved)) return saved;
  } catch { /* Use an empty local interaction log when storage is unavailable. */ }
  return [];
}

function recordInteraction(account, eventType, details = {}) {
  const recommendation = getRecommendation(account);
  interactionEvents.unshift({
    event_id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: new Date().toISOString(),
    account_id: account.id,
    account_name: account.name,
    nba_rule_id: account.activeNbaRuleId || recommendation.rule.rule_id,
    trigger: account.activeNbaTrigger || recommendation.rule.behavior.summary,
    event_type: eventType,
    provenance: 'Synthetic local demo interaction',
    ...details
  });
  interactionEvents = interactionEvents.slice(0, 200);
  try { localStorage.setItem(interactionStorageKey, JSON.stringify(interactionEvents)); }
  catch { notice.textContent = 'This browser could not save the interaction log.'; }
  renderDemoOutcomes();
}

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify(accounts)); return true; }
  catch { notice.textContent = 'This browser could not save the demo state. The current session is still available.'; return false; }
}

function readField(account, field) {
  return field.split('.').reduce((value, key) => value?.[key], account);
}

function conditionMatches(account, condition) {
  const actual = readField(account, condition.field);
  switch (condition.operator) {
    case 'equals': return actual === condition.value;
    case 'not_equals': return actual !== condition.value;
    case 'gt': return typeof actual === 'number' && actual > condition.value;
    case 'gte': return typeof actual === 'number' && actual >= condition.value;
    case 'lt': return typeof actual === 'number' && actual < condition.value;
    case 'lte': return typeof actual === 'number' && actual <= condition.value;
    case 'lt_field': return typeof actual === 'number' && typeof readField(account, condition.value) === 'number' && actual < readField(account, condition.value);
    case 'gte_field': return typeof actual === 'number' && typeof readField(account, condition.value) === 'number' && actual >= readField(account, condition.value);
    case 'in': return Array.isArray(condition.value) && condition.value.includes(actual);
    default: return false;
  }
}

function matchesConditions(account, conditions = {}) {
  const all = conditions.all || [];
  const any = conditions.any || [];
  return all.every(condition => conditionMatches(account, condition)) && (!any.length || any.some(condition => conditionMatches(account, condition)));
}

function getRecommendation(account) {
  const matchingRules = nbaConfig.nba_rules
    .filter(rule => rule.rule_id !== 'no_specific_rule' && matchesConditions(account, rule.when))
    .sort((left, right) => right.priority_rank - left.priority_rank);
  const rule = matchingRules[0] || nbaConfig.nba_rules.find(item => item.rule_id === 'no_specific_rule');
  const conversionInsights = nbaConfig.conversion_associations.filter(association => matchesConditions(account, association.when));
  const isActivated = account.firstValue === true;
  const priority = rule.recommendation_label || (isActivated ? 'Reached value' : rule.priority_rank >= 85 ? 'High priority' : rule.priority_rank > 0 ? 'Suggested' : 'Monitor');
  const type = rule.recommendation_type || (isActivated ? 'success' : rule.priority_rank >= 85 ? 'high' : rule.priority_rank > 0 ? 'medium' : 'low');
  return { rule, priority, type, conversionInsights };
}

function formatPercent(numerator, denominator) {
  return denominator ? `${(numerator / denominator * 100).toFixed(1)}%` : '—';
}

function renderAnalytics() {
  if (!analyticsConfig) return;
  const dashboard = document.querySelector('#analytics-dashboard');
  const experiment = analyticsConfig.pal_experiment;
  const [control, treatment] = experiment.arms;
  const controlRate = control.first_value_within_7_days / control.eligible_accounts;
  const treatmentRate = treatment.first_value_within_7_days / treatment.eligible_accounts;
  const acceptanceRate = treatment.pal_accepted / treatment.pal_invitations;
  const abandonmentRate = treatment.pal_abandoned / treatment.pal_accepted;
  const valueLift = (treatmentRate - controlRate) * 100;
  const sdr = analyticsConfig.ai_sdr_health;
  const sdrRate = sdr.qualified_opportunities / sdr.meetings_held;
  const sdrStatus = sdr.meetings_held < sdr.minimum_meetings_for_review ? 'Insufficient sample' : sdrRate < sdr.target_rate ? 'Below target' : 'At or above target';
  const rows = experiment.arms.map(arm => {
    const firstValueRate = formatPercent(arm.first_value_within_7_days, arm.eligible_accounts);
    const abandon = arm.pal_accepted ? formatPercent(arm.pal_abandoned, arm.pal_accepted) : '—';
    const averageMinutes = arm.average_pal_minutes === null ? '—' : `${arm.average_pal_minutes.toFixed(1)} min`;
    return `<tr><td>${escapeHtml(arm.name)}</td><td>${arm.eligible_accounts}</td><td>${firstValueRate}</td><td>${arm.pal_accepted}/${arm.pal_invitations || 0}</td><td>${arm.pal_completed}</td><td>${abandon}</td><td>${averageMinutes}</td></tr>`;
  }).join('');
  dashboard.innerHTML = `<div class="analytics-heading"><div><p class="eyebrow">PROACTIVE GROWTH TESTS</p><h2>PAL &amp; agent performance</h2><p>Illustrative dashboard for experiment design and operating metrics.</p></div><span class="synthetic-badge">${escapeHtml(analyticsConfig.data_status)}</span></div>
    <div class="analytics-cards">
      <article class="analytics-card"><span>First value · standard</span><strong>${formatPercent(control.first_value_within_7_days, control.eligible_accounts)}</strong><small>${control.first_value_within_7_days} of ${control.eligible_accounts} eligible accounts</small></article>
      <article class="analytics-card"><span>First value · proactive PAL</span><strong>${formatPercent(treatment.first_value_within_7_days, treatment.eligible_accounts)}</strong><small>${valueLift >= 0 ? '+' : ''}${valueLift.toFixed(1)} percentage points vs. standard · synthetic only</small></article>
      <article class="analytics-card"><span>PAL invitation acceptance</span><strong>${formatPercent(treatment.pal_accepted, treatment.pal_invitations)}</strong><small>${treatment.pal_accepted} accepted of ${treatment.pal_invitations} invitations</small></article>
      <article class="analytics-card"><span>Average PAL conversation</span><strong>${treatment.average_pal_minutes.toFixed(1)} min</strong><small>Per completed PAL conversation</small></article>
      <article class="analytics-card"><span>PAL conversation abandonment</span><strong>${formatPercent(treatment.pal_abandoned, treatment.pal_accepted)}</strong><small>${treatment.pal_abandoned} abandoned of ${treatment.pal_accepted} accepted sessions</small></article>
    </div>
    <div class="analytics-table-wrap"><div class="section-heading"><h3>${escapeHtml(experiment.title)}</h3><span class="subtle-label">${escapeHtml(experiment.status)}</span></div><table class="analytics-table"><thead><tr><th>Test arm</th><th>Eligible accounts</th><th>First value in 7 days</th><th>PAL accepted / invited</th><th>Completed PAL sessions</th><th>Abandonment</th><th>Avg. minutes / PAL conversation</th></tr></thead><tbody>${rows}</tbody></table><p class="analytics-note">Minimum planning threshold: ${experiment.minimum_eligible_accounts_per_arm} eligible accounts per arm (illustrative). Final sample size requires a power calculation. The demo does not randomize accounts or establish causal lift.</p></div>
    <div class="sdr-health"><div><p class="eyebrow">CUSTOMER OUTCOME CHECK</p><h3>AI SDR quality signal</h3><p>${escapeHtml(sdrStatus)} · ${sdr.qualified_opportunities} qualified opportunities from ${sdr.meetings_held} meetings in ${sdr.data_window_days} days.</p></div><div class="sdr-rate"><strong>${formatPercent(sdr.qualified_opportunities, sdr.meetings_held)}</strong><span>vs. ${formatPercent(sdr.target_rate * 100, 100)} account target</span><small>Review threshold: ${sdr.minimum_meetings_for_review} meetings · synthetic account: ${escapeHtml(sdr.account_id)}</small></div></div>`;
}

function renderDemoOutcomes() {
  const panel = document.querySelector('#demo-outcomes');
  if (!panel) return;
  const count = type => interactionEvents.filter(event => event.event_type === type).length;
  const satisfaction = interactionEvents.filter(event => event.event_type === 'pal_feedback_recorded');
  const helpfulCount = satisfaction.filter(event => event.feedback === 'helpful').length;
  const rows = interactionEvents.slice(0, 12).map(event => {
    const label = {
      pal_invitation_offered: 'Invitation shown',
      pal_invitation_accepted: 'Invitation accepted',
      pal_invitation_declined: 'Invitation declined',
      pal_session_milestone_recorded: 'First value marked reached',
      pal_session_closed_without_milestone: 'Session closed without milestone',
      pal_feedback_recorded: `Feedback: ${String(event.feedback ?? 'unspecified').replaceAll('_', ' ')}`,
      tavus_api_test_created: 'Tavus API test created (PAL did not join)',
      tavus_live_conversation_created: 'Live Tavus conversation created'
    }[event.event_type] || event.event_type;
    return `<tr><td>${escapeHtml(new Date(event.timestamp).toLocaleString('en-US'))}</td><td>${escapeHtml(event.account_name)}</td><td>${escapeHtml(label)}</td><td>${escapeHtml(event.nba_rule_id)}</td></tr>`;
  }).join('');
  panel.innerHTML = `<div class="outcomes-heading"><div><p class="eyebrow">THIS BROWSER ONLY</p><h2>Demo conversation outcomes</h2><p>Interaction events are saved locally for review. They are not Tavus telemetry or A/B test results.</p></div><button class="button button-quiet export-outcomes" type="button" ${interactionEvents.length ? '' : 'disabled'}>Export CSV</button></div>
    <div class="outcomes-metrics"><article><span>Invitations</span><strong>${count('pal_invitation_offered')}</strong></article><article><span>Accepted</span><strong>${count('pal_invitation_accepted')}</strong></article><article><span>Milestones reached</span><strong>${count('pal_session_milestone_recorded')}</strong></article><article><span>Closed without milestone</span><strong>${count('pal_session_closed_without_milestone')}</strong></article><article><span>Helpful feedback</span><strong>${helpfulCount} / ${satisfaction.length}</strong></article><article><span>Tavus conversations</span><strong>${count('tavus_live_conversation_created') + count('tavus_api_test_created')}</strong></article></div>
    <div class="outcomes-table-wrap"><table class="analytics-table"><thead><tr><th>Time</th><th>Account</th><th>Event</th><th>Matched NBA rule</th></tr></thead><tbody>${rows || '<tr><td colspan="4">No local demo interaction recorded yet. Start a simulated invitation or create a Tavus conversation to populate this log.</td></tr>'}</tbody></table></div>
    <p class="analytics-note">Acceptance, completion, abandonment, and stated feedback are counted as separate events. A completed step is a demo entry, not a verified customer outcome.</p>`;
  panel.querySelector('.export-outcomes')?.addEventListener('click', exportInteractionLog);
}

function exportInteractionLog() {
  if (!interactionEvents.length) return;
  const columns = ['timestamp', 'account_id', 'account_name', 'nba_rule_id', 'trigger', 'event_type', 'feedback', 'provenance'];
  const csvCell = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [columns.map(csvCell).join(','), ...interactionEvents.map(event => columns.map(column => csvCell(event[column])).join(','))].join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = 'growth-lab-demo-outcomes.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderMetrics() {
  const reached = accounts.filter(account => account.firstValue).length;
  const actionable = accounts.filter(account => !account.firstValue && account.actionStatus === 'not-offered').length;
  document.querySelector('#metric-accounts').textContent = accounts.length;
  document.querySelector('#metric-activated').textContent = `${reached} / ${accounts.length}`;
  document.querySelector('#metric-actionable').textContent = `${actionable} / ${accounts.length}`;
  document.querySelector('#account-count').textContent = `${accounts.length} accounts`;
}

function renderAccounts() {
  renderMetrics();
  const query = document.querySelector('#search').value.trim().toLocaleLowerCase('en-US');
  const path = document.querySelector('#path-filter').value;
  const visible = accounts.filter(account => {
    const matchesQuery = `${account.name} ${account.stage} ${account.path}`.toLocaleLowerCase('en-US').includes(query);
    return matchesQuery && (path === 'all' || account.path === path);
  });
  body.replaceChildren();
  document.querySelector('#empty-state').hidden = visible.length > 0;
  for (const account of visible) {
    const recommendation = getRecommendation(account);
    const action = recommendation.rule.next_best_action;
    const row = document.createElement('tr');
    if (account.id === selectedId) row.classList.add('selected');
    const name = document.createElement('td');
    name.innerHTML = `<span class="account-avatar">${escapeHtml(account.initials)}</span><span class="account-name">${escapeHtml(account.name)}<small>${escapeHtml(account.plan)}</small></span>`;
    const stage = document.createElement('td'); stage.innerHTML = `<span class="stage-chip">${escapeHtml(account.stage)}</span>`;
    const setup = document.createElement('td'); setup.innerHTML = `<span class="path-label">${escapeHtml(account.path)}</span>`;
    const actionCell = document.createElement('td'); actionCell.innerHTML = `<span class="priority ${recommendation.type}">${escapeHtml(recommendation.priority)}</span><small class="action-name">${escapeHtml(action.title)}</small>`;
    const openCell = document.createElement('td'); const open = document.createElement('button');
    open.className = 'row-open'; open.type = 'button'; open.textContent = 'View'; open.setAttribute('aria-label', `View ${account.name}`); open.addEventListener('click', () => selectAccount(account.id)); openCell.append(open);
    row.append(name, stage, setup, actionCell, openCell); body.append(row);
  }
}

function updateVisibleAccounts() {
  const query = document.querySelector('#search').value.trim().toLocaleLowerCase('en-US');
  const path = document.querySelector('#path-filter').value;
  const visible = accounts.filter(account => `${account.name} ${account.stage} ${account.path}`.toLocaleLowerCase('en-US').includes(query) && (path === 'all' || account.path === path));
  if (!visible.some(account => account.id === selectedId)) selectedId = visible[0]?.id || null;
  renderAccounts();
  renderDetail();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function formatFeedback(value) {
  return String(value ?? 'not recorded').replaceAll('_', ' ');
}

function displaySignalValue(value) {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value === undefined || value === null || value === '') return 'Unknown';
  return String(value);
}

function renderDetail() {
  if (!nbaConfig) return;
  const account = accounts.find(item => item.id === selectedId);
  if (!account) { detail.innerHTML = '<div class="empty-detail"><div class="empty-icon">↗</div><h2>Select an account</h2><p>See its lifecycle evidence, NBA rationale, and PAL intervention flow.</p></div>'; return; }
  const recommendation = getRecommendation(account);
  const rule = recommendation.rule;
  const action = rule.next_best_action;
  const behaviorRows = rule.behavior.input_signals.map(signal => `<li><span>${escapeHtml(signal.description)}</span><strong>${escapeHtml(displaySignalValue(readField(account, signal.field)))}</strong></li>`).join('');
  const conversionRows = recommendation.conversionInsights.length
    ? recommendation.conversionInsights.map(insight => `<div class="conversion-insight"><span class="illustrative-badge">Illustrative</span><strong>${escapeHtml(insight.display_value)}</strong><p>${escapeHtml(insight.label)} · ${escapeHtml(insight.outcome)}</p><small>${escapeHtml(insight.source_note)}</small></div>`).join('')
    : '<p class="no-association">No conversion relationship estimated for this behavior.</p>';
  const eventRows = account.events.map(event => `<li><span class="timeline-marker"></span><div><strong>${escapeHtml(event.name)}</strong><span>${escapeHtml(event.time)} · ${escapeHtml(event.provenance)}</span></div></li>`).join('');
  const statusCopy = account.actionStatus === 'complete' ? 'Intervention completed' : account.actionStatus === 'declined' ? 'Invitation declined' : account.actionStatus === 'closed' ? 'Session closed without progress' : account.actionStatus === 'accepted' ? 'PAL session simulated' : account.actionStatus === 'awaiting-feedback' ? 'Awaiting satisfaction feedback' : account.actionStatus === 'feedback-recorded' ? 'Feedback captured · call still open' : account.actionStatus === 'offered' ? 'Invitation offered' : 'No intervention yet';
  const experiment = action.experiment_design;
  const experimentMarkup = experiment ? `<div class="decision-fact"><span>${escapeHtml(experiment.title || 'Experiment design')} · ${escapeHtml(experiment.status)}</span><strong>${escapeHtml(experiment.hypothesis)}</strong><ul class="signal-values"><li><span>Eligible population</span><strong>${escapeHtml(experiment.eligible_population)}</strong></li>${experiment.arms.map(arm => `<li><span>${escapeHtml(arm.arm)}</span><strong>${escapeHtml(arm.experience)}</strong></li>`).join('')}<li><span>Primary metric</span><strong>${escapeHtml(experiment.primary_metric)}</strong></li>${experiment.guardrail_metrics.map(metric => `<li><span>Guardrail</span><strong>${escapeHtml(metric)}</strong></li>`).join('')}</ul><small>Randomization unit: ${escapeHtml(experiment.randomization_unit)}. This demo does not assign arms or show offers.</small></div>` : '';
  const lastConversation = account.lastTavusConversation;
  const liveSessionStatus = lastConversation
    ? lastConversation.testMode
      ? `<div class="outcome-saved"><span class="checkmark">✓</span><span><strong>Tavus API test created</strong><small>Test mode does not join the call. Conversation ID: ${escapeHtml(lastConversation.conversationId || 'Unavailable')}</small></span></div>`
      : `<div class="outcome-saved"><span class="checkmark">✓</span><span><strong>Live Tavus conversation created</strong><small>Conversation ID: ${escapeHtml(lastConversation.conversationId || 'Unavailable')}</small></span></div>${lastConversation.conversationUrl ? `<a class="button button-quiet full-button live-room-link" href="${escapeHtml(lastConversation.conversationUrl)}" target="_blank" rel="noopener noreferrer">Join live PAL conversation <span>↗</span></a>` : '<p class="microcopy">Tavus did not return a join URL. Check the conversation in PAL Maker.</p>'}`
    : '';
  const identityMatches = identifiedAccountId === account.id && participantName;
  const liveButtonLabel = tavusConfig?.configured ? tavusConfig.testMode ? 'Create no-cost Tavus API test' : 'Start PAL conversation' : 'Configure Tavus server to enable live session';
  const liveControls = `<div class="live-controls">${liveSessionStatus}<button class="button button-primary full-button" data-action="live" ${tavusConfig?.configured && identityMatches ? '' : 'disabled'}>${escapeHtml(liveButtonLabel)} <span>→</span></button><p class="microcopy">${!identityMatches ? 'Enter the participant’s name and load this account’s planned case above before starting.' : tavusConfig?.configured ? tavusConfig.testMode ? 'API test only: Tavus creates an ended conversation and the PAL does not join.' : 'Starts a proactive Tavus onboarding conversation for this selected account; may use plan minutes.' : 'The API key stays on the server. Configure it in the local .env file.'}</p></div>`;
  const actionFlow = experiment
    ? `<div class="outcome-saved"><span class="checkmark">A/B</span><span><strong>Experiment design only</strong><small>No promotion, billing change, or randomized assignment is executed in this prototype.</small></span></div>${liveControls}`
    : account.actionStatus === 'not-offered'
    ? `${liveControls}<button class="button button-quiet full-button simulate-button" data-action="offer">Simulate PAL invitation <span>→</span></button><p class="microcopy">Local simulation only. No notification is sent and no Tavus call starts.</p>`
    : account.actionStatus === 'offered'
      ? `<div class="choice-row"><button class="button button-primary" data-action="accept">Accept &amp; start demo session</button><button class="button button-quiet" data-action="decline">Not now</button></div><p class="microcopy">The invitation is user-controlled. This simulates acceptance in the browser.</p>`
      : account.actionStatus === 'accepted'
        ? `<div class="simulated-call"><div class="simulated-call-head"><span class="live-dot"></span> Simulated PAL session <span class="call-time">00:24</span></div><div class="chat-line pal-line"><span class="chat-avatar">P</span><p><strong>PAL</strong><br>${escapeHtml(palOpening(account))}</p></div><div class="chat-line user-line"><span class="chat-avatar">You</span><p><strong>You</strong><br>I wasn’t sure what to try next.</p></div><div class="chat-line pal-line"><span class="chat-avatar">P</span><p><strong>PAL</strong><br>${escapeHtml(palResponse(action))}</p></div><div class="session-actions"><button class="button button-primary" data-action="complete">Record issue addressed</button><button class="text-button" data-action="close">Record issue unresolved</button></div><p class="microcopy">Scripted demo transcript; this is not a live Tavus session.</p></div>`
        : account.actionStatus === 'awaiting-feedback'
          ? `<div class="simulated-call"><div class="simulated-call-head"><span class="live-dot"></span> Call wrap-up · satisfaction check</div><p class="call-feedback-question">Before we wrap up, was my help useful today?</p><div class="feedback-options"><button class="button button-quiet" data-action="feedback-helpful">Yes, helpful</button><button class="button button-quiet" data-action="feedback-partly">Somewhat</button><button class="button button-quiet" data-action="feedback-unhelpful">No, not yet</button></div><small class="microcopy">The call stays open until the participant gives feedback or chooses to close.</small></div>`
          : account.actionStatus === 'feedback-recorded'
            ? `<div class="feedback-saved">User-reported feedback: <strong>${escapeHtml(formatFeedback(account.lastPalFeedback))}</strong></div><div class="feedback-prompt"><span>PAL next step before ending</span><small>${account.lastPalFeedback === 'not_helpful' ? 'Acknowledge the concern, ask what was missing, and try service recovery first. A one-free-month retention offer is only a hypothetical option for a high-risk guide row after recovery; confirm eligibility and terms.' : account.lastPalFeedback === 'somewhat_helpful' ? 'Ask what would have made the help more useful, then address that gap before closing.' : 'Thank the participant. Mention 50% off for two months only if first value and explicit upgrade or capacity intent are established; ask whether they want details.'}</small></div><button class="button button-primary full-button" data-action="finish-call">Close call</button><p class="microcopy">Offers are scenario examples only. Nothing is applied or sent to billing.</p>`
            : ['complete', 'closed'].includes(account.actionStatus)
              ? `<div class="outcome-saved"><span class="checkmark">✓</span><span><strong>${statusCopy}</strong><small>${account.actionStatus === 'complete' ? 'The demo milestone and satisfaction check are saved locally; this is not a measured product outcome.' : 'The session closed without the milestone after the satisfaction check.'}</small></span></div>${account.lastPalFeedback ? `<div class="feedback-saved">User-reported feedback: <strong>${escapeHtml(formatFeedback(account.lastPalFeedback))}</strong></div>` : ''}<button class="button button-quiet full-button" data-action="reset-action">Reset this account’s intervention</button>`
          : `<div class="outcome-saved"><span class="checkmark">✓</span><span><strong>${statusCopy}</strong><small>No follow-up is sent automatically.</small></span></div><button class="button button-quiet full-button" data-action="reset-action">Reset this account’s intervention</button>`;

  const accountOptions = accounts.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === account.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
  detail.innerHTML = `<section class="identity-card"><div><p class="eyebrow">BEFORE THE PAL CALL</p><h3>Who is joining?</h3><p>Enter your name and choose the company scenario. That company’s signal and next best action will guide the PAL’s opening.</p></div><form id="participant-form" class="participant-form"><label>Participant name<input id="participant-name" name="participantName" type="text" maxlength="60" autocomplete="name" placeholder="e.g. Alex Morgan" value="${escapeHtml(participantName)}" required pattern="[\\p{L}\\p{M} .’'-]{1,60}" title="Use letters, spaces, apostrophes, periods, or hyphens."></label><label>Company / demo account<select id="identity-account" name="accountId">${accountOptions}</select></label><button class="button button-primary" type="submit">Load planned NBA case <span>→</span></button></form>${identityMatches ? `<p class="identity-confirmation">✓ ${escapeHtml(participantName)} is matched to ${escapeHtml(account.name)} · ${escapeHtml(rule.rule_id)}</p>` : '<p class="identity-hint">The selected company determines the trigger, signals, and NBA—not the participant’s name.</p>'}</section>
    <div class="detail-head"><div class="detail-account"><span class="account-avatar large">${escapeHtml(account.initials)}</span><div><p class="eyebrow">SELECTED ACCOUNT</p><h2>${escapeHtml(account.name)}</h2><span class="detail-subtitle">${escapeHtml(account.plan)} · ${escapeHtml(account.path)}</span></div></div><button class="icon-button" type="button" data-action="next" aria-label="Select next account">↗</button></div>
    <div class="need-card"><span class="mini-label">STATED USE CASE <span class="provenance">synthetic</span></span><p>${escapeHtml(account.need)}</p></div>
    <section class="detail-section"><div class="section-heading"><h3>Signals &amp; lifecycle evidence</h3><span class="subtle-label">Fictional events</span></div><ol class="timeline">${eventRows}</ol></section>
    <section class="trigger-card"><div><p class="eyebrow">WHY THE PAL IS REACHING OUT</p><strong>${escapeHtml(rule.behavior.summary)}</strong><small>Matched by ${escapeHtml(rule.rule_id)} · synthetic account data</small></div></section>
    <section class="nba-card"><div class="nba-card-top"><span class="eyebrow">NEXT BEST ACTION</span><span class="priority ${recommendation.type}">${escapeHtml(recommendation.priority)}</span></div>
      <div class="decision-fact"><span>Observed behavior</span><strong>${escapeHtml(rule.behavior.summary)}</strong><ul class="signal-values">${behaviorRows}</ul></div>
      <div class="decision-fact"><span>Bottleneck hypothesis</span><strong>${escapeHtml(rule.bottleneck_hypothesis)}</strong></div>
      <div class="decision-fact"><span>Relationship to conversion</span><div class="conversion-list">${conversionRows}</div></div>
      <div class="decision-action"><span>Recommended action</span><h3>${escapeHtml(action.title)}</h3><p>${escapeHtml(action.channel)}</p></div>
      <div class="why-row"><span>Success event</span><strong>${escapeHtml(action.success_event)}</strong></div>
      ${experimentMarkup}
      <details class="guardrails"><summary>Decision guardrails</summary><ul>${rule.guardrails.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>
      <p class="rule-id">Rule: ${escapeHtml(rule.rule_id)}</p>
    </section>
    <section class="intervention"><div class="section-heading"><h3>${experiment ? escapeHtml(experiment.title || 'Proposed experiment') : 'PAL intervention'}</h3><span class="subtle-label">${escapeHtml(experiment ? 'Proposed; not launched' : statusCopy)}</span></div>${actionFlow}</section>`;
  detail.querySelector('#participant-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    participantName = form.elements.participantName.value.trim();
    identifiedAccountId = form.elements.accountId.value;
    selectedId = identifiedAccountId;
    renderAccounts();
    renderDetail();
    notice.textContent = `Loaded the planned NBA case for ${participantName} at ${accounts.find(item => item.id === selectedId)?.name}.`;
  });
  detail.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action, account.id)));
}

function palOpening(account) {
  const rule = getRecommendation(account).rule;
  const greetingName = identifiedAccountId === account.id && participantName ? participantName : 'there';
  return `Hi ${greetingName}, glad we connected. I reached out because ${rule.behavior.summary.toLocaleLowerCase('en-US')} What was happening on your side?`;
}

function palResponse(action) {
  return `That makes sense. A helpful next step would be to ${action.title.toLocaleLowerCase('en-US')}. Would you like to work through it together?`;
}

function selectAccount(id) { selectedId = id; identifiedAccountId = null; renderAccounts(); renderDetail(); }

async function handleAction(actionName, id) {
  const account = accounts.find(item => item.id === id); if (!account) return;
  if (actionName === 'next') { const index = accounts.findIndex(item => item.id === id); selectAccount(accounts[(index + 1) % accounts.length].id); return; }
  if (actionName === 'live') {
    const liveButton = detail.querySelector('[data-action="live"]');
    if (liveButton) liveButton.disabled = true;
    notice.textContent = 'Creating a Tavus conversation…';
    const recommendation = getRecommendation(account);
    account.activeNbaRuleId = recommendation.rule.rule_id;
    account.activeNbaTrigger = recommendation.rule.behavior.summary;
    try {
      const response = await fetch('/api/tavus/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: account.id, participantName })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create the Tavus conversation.');
      account.lastTavusConversation = result;
      account.events.push({ time: 'Just now', name: result.testMode ? 'Tavus API test conversation created; PAL did not join' : 'Live Tavus conversation created', provenance: 'Tavus API response' });
      recordInteraction(account, result.testMode ? 'tavus_api_test_created' : 'tavus_live_conversation_created', { conversation_id: result.conversationId, test_mode: result.testMode });
      persist(); renderAccounts(); renderDetail();
      notice.textContent = result.testMode ? `Tavus test conversation created (${result.conversationId}). No PAL joined.` : 'Live Tavus conversation created. Open the join link in the account panel.';
    } catch (error) {
      notice.textContent = error.message;
    } finally {
      if (liveButton?.isConnected) liveButton.disabled = false;
    }
    return;
  }
  if (actionName.startsWith('feedback-')) {
    const feedback = actionName === 'feedback-helpful' ? 'helpful' : actionName === 'feedback-partly' ? 'somewhat_helpful' : 'not_helpful';
    account.lastPalFeedback = feedback;
    account.actionStatus = 'feedback-recorded';
    recordInteraction(account, 'pal_feedback_recorded', { feedback });
    account.events.push({ time: 'Just now', name: 'Satisfaction captured before call ended', provenance: 'User-stated (synthetic demo)' });
    persist(); renderAccounts(); renderDetail();
    notice.textContent = 'Satisfaction recorded. The PAL follow-up now depends on the participant’s answer.';
    return;
  }
  if (actionName === 'reset-action') { account.actionStatus = 'not-offered'; delete account.lastPalFeedback; delete account.pendingResolution; delete account.activeNbaRuleId; delete account.activeNbaTrigger; }
  if (actionName === 'offer') {
    const recommendation = getRecommendation(account);
    account.activeNbaRuleId = recommendation.rule.rule_id;
    account.activeNbaTrigger = recommendation.rule.behavior.summary;
    account.actionStatus = 'offered'; account.events.push({ time: 'Just now', name: 'PAL walkthrough invitation displayed', provenance: 'Synthetic demo action' });
    recordInteraction(account, 'pal_invitation_offered');
  }
  if (actionName === 'accept') { account.actionStatus = 'accepted'; account.events.push({ time: 'Just now', name: 'User accepted the simulated PAL session', provenance: 'Synthetic demo action' }); recordInteraction(account, 'pal_invitation_accepted'); }
  if (actionName === 'decline') { account.actionStatus = 'declined'; account.events.push({ time: 'Just now', name: 'User declined the simulated invitation', provenance: 'Synthetic demo action' }); recordInteraction(account, 'pal_invitation_declined'); }
  if (actionName === 'complete') {
    account.actionStatus = 'awaiting-feedback'; account.pendingResolution = true; account.conversationStarted = true; account.firstValue = true; account.stage = 'First value reached';
    account.events.push({ time: 'Just now', name: 'First useful conversation marked complete', provenance: 'Synthetic demo outcome' });
    recordInteraction(account, 'pal_session_milestone_recorded');
  }
  if (actionName === 'close') { account.actionStatus = 'awaiting-feedback'; account.pendingResolution = false; account.events.push({ time: 'Just now', name: 'Issue marked unresolved; PAL asks for satisfaction before closing', provenance: 'Synthetic demo outcome' }); }
  if (actionName === 'finish-call') { const issueResolved = account.pendingResolution; account.actionStatus = issueResolved ? 'complete' : 'closed'; delete account.pendingResolution; account.events.push({ time: 'Just now', name: 'Call closed after satisfaction check', provenance: 'Synthetic demo action' }); recordInteraction(account, 'pal_call_closed_after_feedback'); if (!issueResolved) recordInteraction(account, 'pal_session_closed_without_milestone'); }
  persist(); renderAccounts(); renderDetail();
  if (actionName === 'complete') notice.textContent = 'Demo outcome recorded. The account advanced to first value; this is not a measured product result.';
  else if (actionName === 'decline') notice.textContent = 'Decline recorded. No follow-up was automatically sent.';
  else notice.textContent = '';
}

document.querySelector('#search').addEventListener('input', updateVisibleAccounts);
document.querySelector('#path-filter').addEventListener('change', updateVisibleAccounts);
document.querySelector('#tab-accounts').addEventListener('click', () => setWorkspaceTab('accounts'));
document.querySelector('#tab-signals').addEventListener('click', () => setWorkspaceTab('signals'));
document.querySelector('#reset-demo').addEventListener('click', () => {
  accounts = structuredClone(demoAccounts); selectedId = 'mosaic';
  interactionEvents = [];
  document.querySelector('#search').value = '';
  document.querySelector('#path-filter').value = 'all';
  try { localStorage.removeItem(storageKey); localStorage.removeItem(interactionStorageKey); } catch { /* The in-memory demo can still reset. */ }
  notice.textContent = 'Demo data and local interaction outcomes reset to the original synthetic cohort.'; renderAccounts(); renderDetail(); renderDemoOutcomes();
});

initialize();
