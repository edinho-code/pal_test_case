import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../pal-session.js', import.meta.url), 'utf8');

async function setup(conversationResponse) {
  const elements = new Map();
  const requests = [];
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', hidden: true, disabled: false, textContent: '', handlers: {},
      addEventListener(type, handler) { this.handlers[type] = handler; },
      append() {}, reportValidity() { return true; }
    });
    return elements.get(id);
  }
  runInNewContext(source, {
    URL,
    document: { querySelector: element, createElement: () => ({}) },
    // Saved dashboard state must never be consulted by this launch page.
    get localStorage() { throw new Error('Old dashboard state accessed'); },
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (url === '/data/demo-accounts.json') return { ok: true, json: async () => [{ id: 'mosaic', name: 'Mosaic Studio', need: 'Try a product tour.' }] };
      if (url === '/api/tavus/config') return { ok: true, json: async () => ({ configured: true, testMode: false }) };
      return conversationResponse;
    }
  });
  await new Promise(resolve => setImmediate(resolve));
  element('#session-name').value = 'Ederson';
  element('#session-account').value = 'mosaic';
  element('#session-account').handlers.change();
  return { element, requests, submit: () => element('#session-form').handlers.submit({ preventDefault() {} }) };
}

test('launches the selected live case without accessing saved dashboard state', async () => {
  const { element, requests, submit } = await setup({ ok: true, json: async () => ({ conversationUrl: 'https://tavus.daily.co/example', testMode: false }) });
  assert.equal(element('#session-start').disabled, false);
  await submit();
  assert.equal(element('#session-join').href, 'https://tavus.daily.co/example');
  assert.equal(element('#session-url').value, 'https://tavus.daily.co/example');
  assert.equal(element('#session-result').hidden, false);
  const createRequest = requests.find(request => request.options?.method === 'POST');
  assert.deepEqual(JSON.parse(createRequest.options.body), { accountId: 'mosaic', participantName: 'Ederson' });
  await submit();
  assert.equal(requests.filter(request => request.options?.method === 'POST').length, 1);
});

test('shows an actionable concurrency error and allows retry', async () => {
  const { element, submit } = await setup({ ok: false, json: async () => ({ error: 'User has reached maximum concurrent conversations' }) });
  await submit();
  assert.match(element('#session-status').textContent, /End that call/);
  assert.equal(element('#session-start').disabled, false);
});
