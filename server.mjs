import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { handleTavusRequest } from './lib/tavus-api.mjs';

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const publicFiles = new Set([
  'pal.html', 'pal-session.js', 'index.html', 'app.js', 'styles.css',
  'data/demo-accounts.json', 'data/nba-rules.json',
  'data/demo-analytics.json', 'data/signal-library.json',
  'docs/project-scope.md'
]);
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8' };

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    await handleTavusRequest(request, response);
    return;
  }
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end('Method not allowed.');
    return;
  }
  const path = url.pathname === '/' ? 'pal.html' : url.pathname === '/dashboard.html' ? 'index.html' : url.pathname.slice(1);
  if (!publicFiles.has(path)) {
    response.writeHead(404).end('Not found.');
    return;
  }
  try {
    const content = await readFile(new URL(path, import.meta.url));
    response.writeHead(200, { 'Content-Type': mimeTypes[extname(path)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found.');
  }
});
server.listen(port, host, () => console.log(`Tavus demo running at http://${host}:${port}`));
