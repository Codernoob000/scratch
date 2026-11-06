// Measure getBoundingClientRect in real headed Chrome at viewport ~1700px
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
// Launch headed Chrome with custom profile
const proc = spawn(chromePath, [
  '--remote-debugging-port=9444',
  '--start-maximized',
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

await send('Page.enable');
await send('DOM.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:4173' });
await new Promise((r) => setTimeout(r, 1500));

// Test 1: Window as opened (maximized)
const resultMaximized = await send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.querySelector('.hero-section .page-container');
    const t = document.querySelector('.ticket-container');
    const h = document.querySelector('.site-header .page-container');
    const name = document.querySelector('.hero-name');
    const cr = c.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const hr = h.getBoundingClientRect();
    const nr = name.getBoundingClientRect();
    const w = window.innerWidth;
    const docW = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    return {
      windowInnerWidth: w,
      docClientWidth: docW,
      scrollWidth: scrollW,
      scrollX: window.scrollX,
      header: { width: hr.width, left: hr.left, right: hr.right, rightMargin: docW - hr.right },
      heroName: { width: nr.width, left: nr.left, right: nr.right, rightMargin: docW - nr.right },
      container: { width: cr.width, left: cr.left, right: cr.right, rightMargin: docW - cr.right },
      ticket: { width: tr.width, left: tr.left, right: tr.right, rightMargin: docW - tr.right }
    };
  })()`,
  returnByValue: true
});
console.log('--- MAXIMIZED (NATURAL) ---');
console.log(JSON.stringify(resultMaximized.result?.value, null, 2));

// Test 2: Viewport width near 1700 (e.g. 1700px via Emulation)
await send('Emulation.setDeviceMetricsOverride', {
  width: 1700,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false
});
await new Promise((r) => setTimeout(r, 600));

const result1700 = await send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.querySelector('.hero-section .page-container');
    const t = document.querySelector('.ticket-container');
    const h = document.querySelector('.site-header .page-container');
    const name = document.querySelector('.hero-name');
    const cr = c.getBoundingClientRect();
    const tr = t.getBoundingClientRect();
    const hr = h.getBoundingClientRect();
    const nr = name.getBoundingClientRect();
    const w = window.innerWidth;
    const docW = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    return {
      windowInnerWidth: w,
      docClientWidth: docW,
      scrollWidth: scrollW,
      scrollX: window.scrollX,
      header: { width: hr.width, left: hr.left, right: hr.right, rightMargin: docW - hr.right },
      heroName: { width: nr.width, left: nr.left, right: nr.right, rightMargin: docW - nr.right },
      container: { width: cr.width, left: cr.left, right: cr.right, rightMargin: docW - cr.right },
      ticket: { width: tr.width, left: tr.left, right: tr.right, rightMargin: docW - tr.right }
    };
  })()`,
  returnByValue: true
});
console.log('--- AT 1700px VIEWPORT ---');
console.log(JSON.stringify(result1700.result?.value, null, 2));

proc.kill();
server.close();
process.exit(0);
