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
console.log('Open pages:', pages.map(p => ({ title: p.title, url: p.url })));
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
  const res = await sendCommand('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) {
    console.error('Eval error:', res.exceptionDetails);
  }
  return res.result?.value;
}

async function navigatePage() {
  await sendCommand('Page.navigate', { url: 'http://127.0.0.1:4173' });
  await new Promise((r) => setTimeout(r, 1200));
}

// Clear localStorage before testing
await evalInPage('localStorage.clear()');
await navigatePage();

// 1. Measure ticket width and margins at 1365, 1643, and 1920px
console.log('=== MEASURING TICKET CONTAINER BOUNDS IN REAL CHROME ===');
const measureWidths = [1365, 1643, 1920];
for (const w of measureWidths) {
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 400));

  const bounds = await evalInPage(`(() => {
    const docWidth = document.documentElement.clientWidth;
    const ticket = document.querySelector('.ticket-container');
    const container = document.querySelector('.hero-section .page-container');
    const tr = ticket.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return {
      viewportWidth: docWidth,
      ticketWidth: Math.round(tr.width),
      ticketLeft: Math.round(tr.left),
      ticketRight: Math.round(tr.right),
      ticketLeftMargin: Math.round(tr.left),
      ticketRightMargin: Math.round(docWidth - tr.right),
      containerWidth: Math.round(cr.width),
      containerLeft: Math.round(cr.left),
      containerRightMargin: Math.round(docWidth - cr.right),
      ticketCentered: Math.abs(Math.round(tr.left) - Math.round(docWidth - tr.right)) <= 1
    };
  })()`);

  console.log('Viewport ' + w + 'px:');
  console.log(JSON.stringify(bounds, null, 2));
}

// Reset viewport to desktop 1280
await sendCommand('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await new Promise((r) => setTimeout(r, 400));

// 2. Check initial state
const initial = await evalInPage(`(() => {
  const hint = document.querySelector('.hero-hint');
  const canvases = document.querySelectorAll('.scratch-canvas');
  const golden = document.querySelector('.ticket-panel.golden');
  return {
    hintPresent: Boolean(hint),
    hintText: hint?.textContent.trim(),
    canvasCount: canvases.length,
    goldenLocked: golden.classList.contains('locked'),
    goldenDisabled: golden.disabled,
    goldenLabel: golden.querySelector('.panel-lock-label')?.textContent.trim()
  };
})()`);
console.log('=== INITIAL STATE ===');
console.log(JSON.stringify(initial, null, 2));

// 3. Perform scratch on panel 0
console.log('=== SCRATCHING PANEL 0 ===');
const scratchResult = await evalInPage(`(async () => {
  const panel = document.querySelectorAll('.ticket-panel')[0];
  const canvas = panel.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();

  const stepsX = 12;
  const stepsY = 8;
  const startX = rect.left + 5;
  const startY = rect.top + 5;
  const dx = (rect.width - 10) / stepsX;
  const dy = (rect.height - 10) / stepsY;

  canvas.dispatchEvent(new PointerEvent('pointerdown', {
    clientX: startX,
    clientY: startY,
    button: 0,
    bubbles: true
  }));

  for (let y = 0; y < stepsY; y++) {
    for (let x = 0; x < stepsX; x++) {
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: startX + x * dx,
        clientY: startY + y * dy,
        button: 0,
        bubbles: true
      }));
    }
  }

  canvas.dispatchEvent(new PointerEvent('pointerup', {
    clientX: rect.right - 5,
    clientY: rect.bottom - 5,
    button: 0,
    bubbles: true
  }));

  await new Promise(r => setTimeout(r, 400));

  const stub = document.querySelector('.ticket-stub');
  const hint = document.querySelector('.hero-hint');
  return {
    panelRevealed: panel.classList.contains('revealed'),
    canvasRemoved: !panel.querySelector('canvas'),
    stubVisible: Boolean(stub),
    stubTitle: stub?.querySelector('.stub-title')?.textContent,
    hintRemovedAfterFirstReveal: hint === null,
    footerCounter: document.querySelector('.ticket-counter')?.textContent.trim(),
    savedStorage: localStorage.getItem('ticket.v1')
  };
})()`);

console.log(JSON.stringify(scratchResult, null, 2));

// 4. Reload page to verify persistence
console.log('=== RELOADING TO VERIFY PERSISTENCE ===');
await navigatePage();

const persistResult = await evalInPage(`(() => {
  const panel0 = document.querySelectorAll('.ticket-panel')[0];
  const stub = document.querySelector('.ticket-stub');
  const hint = document.querySelector('.hero-hint');
  return {
    panel0RevealedOnLoad: panel0.classList.contains('revealed'),
    panel0HasCanvas: Boolean(panel0.querySelector('canvas')),
    hintRemovedOnLoad: hint === null,
    footerCounter: document.querySelector('.ticket-counter')?.textContent.trim(),
    goldenLocked: document.querySelector('.ticket-panel.golden').classList.contains('locked')
  };
})()`);
console.log(JSON.stringify(persistResult, null, 2));

// 5. Reveal 4 more panels (to hit 5 total) and check golden unlock
console.log('=== REVEALING TO 5 PANELS TO UNLOCK GOLDEN ===');
const unlockTest = await evalInPage(`(async () => {
  const panels = Array.from(document.querySelectorAll('.ticket-panel:not(.golden)'));
  for (let i = 1; i < 5; i++) {
    panels[i].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }
  await new Promise(r => setTimeout(r, 300));

  const golden = document.querySelector('.ticket-panel.golden');
  const goldenCanvas = golden.querySelector('canvas');
  return {
    goldenLocked: golden.classList.contains('locked'),
    goldenDisabled: golden.disabled,
    goldenHasCanvas: Boolean(goldenCanvas),
    footerCounter: document.querySelector('.ticket-counter')?.textContent.trim()
  };
})()`);
console.log(JSON.stringify(unlockTest, null, 2));

// 6. Scratch unlocked golden panel
console.log('=== SCRATCHING UNLOCKED GOLDEN PANEL ===');
const goldenScratch = await evalInPage(`(async () => {
  const golden = document.querySelector('.ticket-panel.golden');
  const canvas = golden.querySelector('canvas');
  if (!canvas) return { error: 'No canvas on golden panel' };

  const rect = canvas.getBoundingClientRect();
  const stepsX = 14;
  const stepsY = 8;
  const startX = rect.left + 5;
  const startY = rect.top + 5;
  const dx = (rect.width - 10) / stepsX;
  const dy = (rect.height - 10) / stepsY;

  canvas.dispatchEvent(new PointerEvent('pointerdown', {
    clientX: startX,
    clientY: startY,
    button: 0,
    bubbles: true
  }));

  for (let y = 0; y < stepsY; y++) {
    for (let x = 0; x < stepsX; x++) {
      canvas.dispatchEvent(new PointerEvent('pointermove', {
        clientX: startX + x * dx,
        clientY: startY + y * dy,
        button: 0,
        bubbles: true
      }));
    }
  }

  canvas.dispatchEvent(new PointerEvent('pointerup', {
    clientX: rect.right - 5,
    clientY: rect.bottom - 5,
    button: 0,
    bubbles: true
  }));

  await new Promise(r => setTimeout(r, 400));
  const stub = document.querySelector('.ticket-stub');
  return {
    goldenRevealed: golden.classList.contains('revealed'),
    goldenCanvasRemoved: !golden.querySelector('canvas'),
    stubTitle: stub?.querySelector('.stub-title')?.textContent,
    footerCounter: document.querySelector('.ticket-counter')?.textContent.trim()
  };
})()`);
console.log(JSON.stringify(goldenScratch, null, 2));

// 7. Test "Reveal all" button
console.log('=== TESTING REVEAL ALL BUTTON ===');
const revealAllResult = await evalInPage(`(async () => {
  document.querySelector('.ticket-reveal-all-btn').click();
  await new Promise(r => setTimeout(r, 200));
  const unrevealed = document.querySelectorAll('.ticket-panel.unrevealed');
  const canvases = document.querySelectorAll('.scratch-canvas');
  return {
    unrevealedCount: unrevealed.length,
    remainingCanvases: canvases.length,
    footerCounter: document.querySelector('.ticket-counter')?.textContent.trim(),
    savedCount: JSON.parse(localStorage.getItem('ticket.v1')).length
  };
})()`);
console.log(JSON.stringify(revealAllResult, null, 2));

// Clear storage after test so user has clean slate
await evalInPage('localStorage.clear()');

ws.close();
chromeProc.kill();
server.close();
process.exit(0);
