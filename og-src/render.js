// Renders og.png (link preview, 1200×630) from og.html.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + path.join(__dirname, 'og.html')); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, '..', 'og.png') }); await b.close(); })();
