import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConversationContext, buildCustomGreeting, normalizeParticipantName } from './conversation-context.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const maxBodyBytes = 16_384;

const [accounts, nbaConfig, accountContextConfig] = await Promise.all([
  readFile(join(projectRoot, 'data/demo-accounts.json'), 'utf8').then(JSON.parse),
  readFile(join(projectRoot, 'data/nba-rules.json'), 'utf8').then(JSON.parse),
  readFile(join(projectRoot, 'data/account-context.json'), 'utf8').then(JSON.parse)
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  response.end(JSON.stringify(body));
}

function readField(account, field) {
  return field.split('.').reduce((value, key) => value?.[key], account);
}

function matchesCondition(account, condition) {
  const actual = readField(account, condition.field);
  const expected = condition.value;
  switch (condition.operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'gt': return typeof actual === 'number' && actual > expected;
    case 'gte': return typeof actual === 'number' && actual >= expected;
    case 'lt': return typeof actual === 'number' && actual < expected;
    case 'lte': return typeof actual === 'number' && actual <= expected;
    case 'lt_field': return typeof actual === 'number' && actual < readField(account, expected);
    case 'gte_field': return typeof actual === 'number' && actual >= readField(account, expected);
    case 'in': return Array.isArray(expected) && expected.includes(actual);
    default: return false;
  }
}

function matchesRule(account, rule) {
  const all = rule.when?.all || [];
  const any = rule.when?.any || [];
  return all.every(condition => matchesCondition(account, condition)) && (!any.length || any.some(condition => matchesCondition(account, condition)));
}

function getAccountRecommendation(account) {
  return nbaConfig.nba_rules
    .filter(rule => rule.rule_id !== 'no_specific_rule' && matchesRule(account, rule))
    .sort((left, right) => right.priority_rank - left.priority_rank)[0]
    || nbaConfig.nba_rules.find(rule => rule.rule_id === 'no_specific_rule');
}

async function readJsonBody(request) {
  if (request.body !== undefined) {
    const serialized = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    if (Buffer.byteLength(serialized) > maxBodyBytes) throw new Error('Request body is too large.');
    return JSON.parse(serialized);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleCreateConversation(request, response) {
  const apiKey = process.env.TAVUS_API_KEY;
  const palId = process.env.TAVUS_PAL_ID;
  if (!apiKey || !palId) {
    sendJson(response, 503, { error: 'Tavus is not configured on this server.' });
    return;
  }

  let input;
  try {
    input = await readJsonBody(request);
  } catch (error) {
    sendJson(response, 400, { error: error.message === 'Request body is too large.' ? error.message : 'Request body must be valid JSON.' });
    return;
  }

  const account = accounts.find(item => item.id === input.accountId);
  if (!account) {
    sendJson(response, 404, { error: 'Demo account not found.' });
    return;
  }

  const participantName = normalizeParticipantName(input.participantName);
  if (!participantName) {
    sendJson(response, 400, { error: 'Enter a participant name using up to 60 letters, spaces, apostrophes, periods, or hyphens.' });
    return;
  }

  const recommendation = getAccountRecommendation(account);
  const businessContext = accountContextConfig.accounts.find(item => item.account_id === account.id);

  const testMode = process.env.TAVUS_TEST_MODE !== 'false';
  const payload = {
    pal_id: palId,
    conversation_name: `Tavus Onboarding · ${account.name}`,
    conversational_context: buildConversationContext(account, recommendation, businessContext, accountContextConfig.data_status, participantName),
    custom_greeting: buildCustomGreeting(account, recommendation, participantName),
    dynamic_greeting: false,
    test_mode: testMode
  };
  if (process.env.TAVUS_FACE_ID) payload.face_id = process.env.TAVUS_FACE_ID;

  try {
    const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000)
    });
    const result = await tavusResponse.json().catch(() => ({}));
    if (!tavusResponse.ok) {
      sendJson(response, 502, { error: result.message || result.error || `Tavus returned HTTP ${tavusResponse.status}.` });
      return;
    }
    if (!result.conversation_id) {
      sendJson(response, 502, { error: 'Tavus accepted the request but did not return a conversation ID.' });
      return;
    }
    sendJson(response, 201, {
      conversationId: result.conversation_id,
      conversationUrl: result.conversation_url || null,
      status: result.status,
      testMode
    });
  } catch {
    sendJson(response, 502, { error: 'Could not reach the Tavus API. Check the server network connection and try again.' });
  }
}

export async function handleTavusRequest(request, response) {
  const url = new URL(request.url || '/', 'http://localhost');
  const route = url.searchParams.get('route') || request.query?.route;
  const pathname = route ? `/api/tavus/${route}` : url.pathname;
  if (request.method === 'GET' && pathname === '/api/tavus/config') {
    sendJson(response, 200, {
      configured: Boolean(process.env.TAVUS_API_KEY && process.env.TAVUS_PAL_ID),
      testMode: process.env.TAVUS_TEST_MODE !== 'false',
      faceConfigured: Boolean(process.env.TAVUS_FACE_ID)
    });
    return;
  }
  if (request.method === 'POST' && pathname === '/api/tavus/conversations') {
    await handleCreateConversation(request, response);
    return;
  }
  sendJson(response, 404, { error: 'API route not found.' });
}
