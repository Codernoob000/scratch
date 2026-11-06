// Checks responsive layout bounds, gutters, and centering across breakpoints in real Chrome.
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
  '--remote-debugging-port=9444',
  '--disable-gpu',
  '--no-sandbox',
  '--user-data-dir=' + path.resolve('.temp_chrome_profile'),
  'http://127.0.0.1:4173',
]);

await new Promise((r) => setTimeout(r, 2000));

let versionData;
for (let i = 0; i < 5; i++) {
  try {
    const versionRes = await fetch('http://127.0.0.1:9444/json/version');
    versionData = await versionRes.json();
    if (versionData?.webSocketDebuggerUrl) break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}

const listRes = await fetch('http://127.0.0.1:9444/json');
const pages = await listRes.json();
const appPage = pages.find((p) => p.type === 'page' && !p.url.startsWith('devtools://')) || pages[0];

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
  const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return res.result?.value;
}

await evalInPage('localStorage.clear()');
await sendCommand('Page.navigate', { url: 'http://127.0.0.1:4173' });
await new Promise((r) => setTimeout(r, 1200));

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
    
    // Ticket checks
    const ticketGrid = document.querySelector('.ticket-grid');
    const ticketPanels = Array.from(document.querySelectorAll('.ticket-panel'));
    const goldenPanel = document.querySelector('.ticket-panel.golden');
    const ticketSerial = document.querySelector('.ticket-serial')?.textContent.trim();
    const ticketCounter = document.querySelector('.ticket-counter')?.textContent.trim();
    
    // Projects section checks
    const projectsGrid = document.querySelector('.projects-grid');
    const projectCards = Array.from(document.querySelectorAll('.project-card'));
    const lastProjectCard = projectCards[projectCards.length - 1];
    const isGoldenLast = Boolean(lastProjectCard.querySelector('.project-badge-shelved'));
    
    return {
      viewportWidth: docWidth,
      scrollWidth: scrollW,
      hasOverflow: scrollW > docWidth,
      ticket: {
        serial: ticketSerial,
        initialCounter: ticketCounter,
        totalPanels: ticketPanels.length,
        gridColumns: getComputedStyle(ticketGrid).gridTemplateColumns.split(' ').length,
        goldenColSpan: getComputedStyle(goldenPanel).gridColumn,
      },
      projects: {
        totalCards: projectCards.length,
        gridColumns: getComputedStyle(projectsGrid).gridTemplateColumns.split(' ').length,
        goldenCardIsLast: isGoldenLast,
        goldenCardTitle: lastProjectCard.querySelector('.project-title')?.textContent.trim(),
        goldenCardColSpan: getComputedStyle(lastProjectCard).gridColumn
      }
    };
  })()`);

  console.log('--- Width ' + w + 'px ---');
  console.log(JSON.stringify(result, null, 2));
}

ws.close();
chromeProc.kill();
server.close();
process.exit(0);
