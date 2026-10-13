import test from 'node:test';
import assert from 'node:assert/strict';
import { handleTavusRequest } from '../lib/tavus-api.mjs';

function responseRecorder() {
  return {
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(body) { this.body = JSON.parse(body); }
  };
}

test('Vercel rewritten routes accept parsed JSON and keep credentials server-side', async t => {
  const previous = { ...process.env };
  const previousFetch = globalThis.fetch;
  t.after(() => {
    for (const key of ['TAVUS_API_KEY', 'TAVUS_PAL_ID', 'TAVUS_TEST_MODE']) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
    globalThis.fetch = previousFetch;
  });
  process.env.TAVUS_API_KEY = 'test-server-secret';
  process.env.TAVUS_PAL_ID = 'test-pal';
  process.env.TAVUS_TEST_MODE = 'true';
  const config = responseRecorder();
  await handleTavusRequest({ method: 'GET', url: '/api/index?route=config' }, config);
  assert.equal(config.status, 200);
  assert.equal(config.body.configured, true);
  assert.doesNotMatch(JSON.stringify(config.body), /test-server-secret/);

  let sentPayload;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://tavusapi.com/v2/conversations');
    sentPayload = JSON.parse(options.body);
    return { ok: true, json: async () => ({ conversation_id: 'test-conversation', status: 'ended' }) };
  };
  const result = responseRecorder();
  await handleTavusRequest({ method: 'POST', url: '/api/index?route=conversations', body: { accountId: 'mosaic', participantName: 'Alex' } }, result);
  assert.equal(result.status, 201);
  assert.match(sentPayload.custom_greeting, /^Hi Alex,/);
  assert.match(sentPayload.conversational_context, /Account: Mosaic Studio/);
  assert.equal(sentPayload.dynamic_greeting, false);
  assert.equal(sentPayload.test_mode, true);
  assert.doesNotMatch(JSON.stringify(result.body), /test-server-secret/);

  const invalid = responseRecorder();
  await handleTavusRequest({ method: 'POST', url: '/api/index?route=conversations', body: { accountId: 'missing', participantName: 'Alex' } }, invalid);
  assert.equal(invalid.status, 404);
});
