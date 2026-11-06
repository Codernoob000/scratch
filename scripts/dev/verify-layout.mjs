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
  const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return res.result?.value;
}

const checkWidths = [1280, 1365, 1536, 1920];
for (const w of checkWidths) {
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 500));

  const result = await evalInPage(`(() => {
    const docWidth = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const containers = Array.from(document.querySelectorAll('.page-container')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.parentElement.tagName.toLowerCase() + (el.parentElement.className ? '.' + el.parentElement.className : ''),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        leftMargin: Math.round(r.left),
        rightMargin: Math.round(docWidth - r.right),
        centered: Math.abs(Math.round(r.left) - Math.round(docWidth - r.right)) <= 1
      };
    });

    const overflowing = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > docWidth + 1) {
        overflowing.push({
          tag: el.tagName.toLowerCase(),
          className: el.className,
          right: Math.round(r.right),
          overflowBy: Math.round(r.right - docWidth)
        });
      }
    });

    return {
      clientWidth: docWidth,
      scrollWidth: scrollW,
      hasOverflow: scrollW > docWidth,
      containers,
      overflowingElements: overflowing.slice(0, 5)
    };
  })()`);

  console.log('--- Width ' + w + 'px ---');
  console.log(JSON.stringify(result, null, 2));
}

ws.close();
chromeProc.kill();
server.close();
process.exit(0);
