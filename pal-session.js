// This entry page does not load dashboard code or browser-saved demo state.
const form = document.querySelector('#session-form');
const nameInput = document.querySelector('#session-name');
const companyInput = document.querySelector('#session-account');
const startButton = document.querySelector('#session-start');
const status = document.querySelector('#session-status');
const caseDescription = document.querySelector('#session-case');
const resultPanel = document.querySelector('#session-result');
const joinLink = document.querySelector('#session-join');
let scenarios = [];
let config = null;
let busy = false;
let sessionCreated = false;

function updateSelection() {
  const account = scenarios.find(item => item.id === companyInput.value);
  caseDescription.textContent = account ? `${account.name}: ${account.need}` : '';
  startButton.disabled = busy || sessionCreated || !config?.configured || !account || !nameInput.value.trim();
}

async function loadScenarios() {
  try {
    const [accountsResponse, configResponse] = await Promise.all([
      fetch('/data/demo-accounts.json', { cache: 'no-store' }),
      fetch('/api/tavus/config', { cache: 'no-store' })
    ]);
    if (!accountsResponse.ok || !configResponse.ok) throw new Error('Could not load the demo. Please reload this page.');
    scenarios = await accountsResponse.json();
    config = await configResponse.json();
    for (const account of scenarios) {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      companyInput.append(option);
    }
    startButton.textContent = config.testMode ? 'Create API test' : 'Start PAL conversation';
    status.textContent = !config.configured ? 'Tavus is not configured on this server.' : config.testMode ? 'API test mode: the PAL will not join.' : 'Choose your company and enter your name to start.';
    updateSelection();
  } catch (error) {
    status.textContent = error.message;
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy || sessionCreated || !form.reportValidity() || !config?.configured) return;
  busy = true;
  updateSelection();
  status.textContent = 'Preparing your company’s planned PAL conversation…';
  try {
    const response = await fetch('/api/tavus/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: companyInput.value, participantName: nameInput.value.trim() })
    });
    const result = await response.json();
    if (!response.ok) {
      const message = String(result?.error || 'Could not start the conversation.');
      throw new Error(message.toLowerCase().includes('maximum concurrent')
        ? 'A Tavus conversation is already active. End that call before starting another.'
        : message);
    }
    if (result.testMode) {
      sessionCreated = true;
      status.textContent = 'API test succeeded. The PAL does not join in test mode.';
      return;
    }
    if (!result.conversationUrl) throw new Error('Tavus did not return a join link. Check the conversation in Tavus before trying again.');
    const roomUrl = new URL(result.conversationUrl);
    if (roomUrl.protocol !== 'https:') throw new Error('Tavus returned an invalid room link.');
    joinLink.href = roomUrl.href;
    document.querySelector('#session-url').value = roomUrl.href;
    resultPanel.hidden = false;
    startButton.hidden = true;
    nameInput.disabled = true;
    companyInput.disabled = true;
    sessionCreated = true;
    status.textContent = 'Click Open live PAL session above to join your conversation.';
  } catch (error) {
    status.textContent = error.message;
  } finally {
    busy = false;
    updateSelection();
  }
});
nameInput.addEventListener('input', updateSelection);
companyInput.addEventListener('change', updateSelection);
loadScenarios();
