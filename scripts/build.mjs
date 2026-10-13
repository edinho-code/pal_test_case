import { mkdir, copyFile, rm } from 'node:fs/promises';
import { dirname } from 'node:path';

// Publish only deliberate public assets. Credentials and internal context stay server-side.
await rm('public', { recursive: true, force: true });
const assets = [
  ['pal.html', 'index.html'], ['pal.html', 'pal.html'], ['index.html', 'dashboard.html'],
  ['pal-session.js', 'pal-session.js'], ['app.js', 'app.js'], ['styles.css', 'styles.css'],
  ['data/demo-accounts.json', 'data/demo-accounts.json'], ['data/nba-rules.json', 'data/nba-rules.json'],
  ['data/demo-analytics.json', 'data/demo-analytics.json'], ['data/signal-library.json', 'data/signal-library.json'],
  ['docs/project-scope.md', 'docs/project-scope.md']
];
for (const [source, target] of assets) {
  await mkdir(dirname(`public/${target}`), { recursive: true });
  await copyFile(source, `public/${target}`);
}
console.log('Built public demo assets. Internal account context is excluded.');
