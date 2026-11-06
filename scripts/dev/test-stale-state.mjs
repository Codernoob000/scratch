// Verify stale state seeding in real Chrome
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const distDir = path.resolve('dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath)) filePath = path.resolve('public', reqPath.replace(/^\//, ''));
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((r) => server.listen(4173, '127.0.0.1', r));

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const proc = spawn(chromePath, [
  '--remote-debugging-port=9444',
  '--user-data-dir=' + path.resolve('.temp_chrome_profile'),
  'http://127.0.0.1:4173'
]);

await new Promise((r) => setTimeout(r, 2000));
const pages = await (await fetch('http://127.0.0.1:9444/json')).json();
const appPage = pages.find((p) => p.type === 'page' && !p.url.startsWith('devtools://')) || pages[0];
const ws = new WebSocket(appPage.webSocketDebuggerUrl);
await new Promise((r) => ws.onopen = r);

let idCounter = 1;
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = idCounter++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

// 1. Seed localStorage with ['promptshield', 'removed-id']
await send('Runtime.evaluate', {
  expression: "localStorage.setItem('ticket.v2', JSON.stringify(['promptshield', 'removed-id']))"
});

// 2. Reload page
await send('Page.reload');
await new Promise((r) => setTimeout(r, 1200));

// 3. Read ticket counter text
const counterResult = await send('Runtime.evaluate', {
  expression: "document.querySelector('.ticket-counter').textContent.trim()",
  returnByValue: true
});

console.log('Seeded counter result:', counterResult.result.value);

// Clear localStorage after test
await send('Runtime.evaluate', {
  expression: "localStorage.clear()"
});

ws.close();
proc.kill();
server.close();
process.exit(0);
