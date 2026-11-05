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
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  let filePath = path.join(distDir, reqPath);
  
  if (!fs.existsSync(filePath)) {
    const publicPath = path.resolve('public', reqPath.replace(/^\//, ''));
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    } else {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  '--user-data-dir=' + path.resolve('.temp_chrome_profile'),
  'http://127.0.0.1:4173',
]);

await new Promise((r) => setTimeout(r, 2000));

let versionData;
for (let i = 0; i < 5; i++) {
  try {
    const versionRes = await fetch('http://127.0.0.1:9222/json/version');
    versionData = await versionRes.json();
    if (versionData?.webSocketDebuggerUrl) break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

const listRes = await fetch('http://127.0.0.1:9222/json');
const pages = await listRes.json();
const appPage = pages.find((p) => p.url.includes('4173')) || pages[0];

const ws = new WebSocket(appPage.webSocketDebuggerUrl);
await new Promise((resolve) => ws.onopen = resolve);

let idCounter = 1;
function sendCommand(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await sendCommand('Page.enable');
await sendCommand('DOM.enable');

async function evalInPage(expression) {
  const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true });
  return res.result?.value;
}

// Clear localStorage
await evalInPage('localStorage.clear()');
await evalInPage('location.reload()');
await new Promise((r) => setTimeout(r, 1000));

const checkWidths = [360, 768, 1280];
for (const w of checkWidths) {
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: w <= 768,
  });
  await new Promise((r) => setTimeout(r, 500));

  const result = await evalInPage(`(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const ticket = document.querySelector('.ticket-container');
    const ticketRect = ticket.getBoundingClientRect();
    const grid = document.querySelector('.ticket-grid');
    const gridStyle = getComputedStyle(grid);
    const panels = Array.from(document.querySelectorAll('.ticket-panel'));
    const goldenPanel = document.querySelector('.ticket-panel.golden');
    const firstPanel = panels[0];
    const firstPanelRect = firstPanel.getBoundingClientRect();

    return {
      width: docWidth,
      scrollWidth: scrollW,
      hasOverflow: scrollW > docWidth,
      ticketLeftGutter: Math.round(ticketRect.left),
      ticketRightGutter: Math.round(docWidth - ticketRect.right),
      gridColumns: gridStyle.gridTemplateColumns.split(' ').length,
      panelHeight: Math.round(firstPanelRect.height),
      goldenSpansTwoCols: getComputedStyle(goldenPanel).gridColumn.includes('span 2'),
      panelsCount: panels.length,
      counterText: document.querySelector('.ticket-counter').textContent.trim(),
      hintText: document.querySelector('.hero-hint span').textContent.trim()
    };
  })()`);

  console.log('--- Width ' + w + 'px ---');
  console.log(JSON.stringify(result, null, 2));
}

// Test interactivity: click first panel
await evalInPage(`(() => {
  const firstPanel = document.querySelectorAll('.ticket-panel')[0];
  firstPanel.click();
})()`);

await new Promise((r) => setTimeout(r, 200));

const clickResult = await evalInPage(`(() => {
  const firstPanel = document.querySelectorAll('.ticket-panel')[0];
  const stub = document.querySelector('.ticket-stub');
  const liveRegion = document.querySelector('.sr-only[aria-live]');
  return {
    firstPanelRevealed: firstPanel.classList.contains('revealed'),
    stubVisible: Boolean(stub),
    stubTitle: stub ? stub.querySelector('.stub-title').textContent : null,
    counterText: document.querySelector('.ticket-counter').textContent.trim(),
    hintText: document.querySelector('.hero-hint span').textContent.trim(),
    liveAnnouncement: liveRegion ? liveRegion.textContent.trim() : null,
    savedStorage: localStorage.getItem('ticket.v1')
  };
})()`);

console.log('--- After clicking first panel ---');
console.log(JSON.stringify(clickResult, null, 2));

// Test unlock after 5 reveals
await evalInPage(`(() => {
  const panels = Array.from(document.querySelectorAll('.ticket-panel:not(.golden)'));
  for (let i = 1; i < 5; i++) {
    panels[i].click();
  }
})()`);

await new Promise((r) => setTimeout(r, 200));

const unlockResult = await evalInPage(`(() => {
  const goldenPanel = document.querySelector('.ticket-panel.golden');
  return {
    goldenLocked: goldenPanel.classList.contains('locked'),
    goldenDisabled: goldenPanel.disabled,
    goldenLabel: goldenPanel.querySelector('.panel-lock-label')?.textContent.trim(),
    counterText: document.querySelector('.ticket-counter').textContent.trim()
  };
})()`);

console.log('--- After 5 reveals (Golden Panel state) ---');
console.log(JSON.stringify(unlockResult, null, 2));

ws.close();
chromeProc.kill();
server.close();
process.exit(0);
