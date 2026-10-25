// FuelWatch QA: node qa.cjs <baseUrl> [mock]   (mock = serve station list from fixture, for boxes that can't reach Overpass)
const { chromium } = require('/workspace/rescue-app/tests/node_modules/playwright');
const fs = require('fs');
const BASE = process.argv[2] || 'http://localhost:8899', MOCK = process.argv[3] === 'mock';
const OUT = __dirname + '/shots'; fs.mkdirSync(OUT, { recursive: true });
const fixture = fs.readFileSync(__dirname + '/stations-fixture.json', 'utf8');
const results = []; const ok = (name, pass, info = '') => { results.push({ name, pass, info }); console.log((pass ? 'PASS ' : 'FAIL ') + name + (info ? ' — ' + info : '')); };
const GEO = { latitude: 35.0456, longitude: -85.3097 };
async function ctx(b, opts = {}) {
  const c = await b.newContext({ viewport: opts.wide ? { width: 1280, height: 800 } : { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: !opts.wide, hasTouch: !opts.wide, geolocation: GEO, permissions: opts.deny ? [] : ['geolocation'] });
  if (MOCK) await c.route('**/api/stations*', r => r.fulfill({ status: 200, contentType: 'application/json', body: fixture }));
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.errs = errs; return p;
}
(async () => {
  const b = await chromium.launch();
  // --- Phone A
  const a = await ctx(b);
  await a.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await a.waitForSelector('.chip', { timeout: 30000 });
  await a.waitForTimeout(800);
  await a.screenshot({ path: OUT + '/1-phone-ping.png' });
  ok('Use my location button visible', await a.isVisible('#locBtn'));
  ok('GPS locked message', /GPS locked/.test(await a.textContent('#gpsMsg')), await a.textContent('#gpsMsg'));
  const chips = await a.$$eval('.chip', cs => cs.map(c => c.innerText.replace(/\s+/g, ' ').trim()));
  const uniq = new Set(chips);
  ok('station chips are unique (name · street · distance)', uniq.size === chips.length, `${uniq.size}/${chips.length} unique; e.g. ${chips.slice(0, 4).join(' | ')}`);
  ok('no bare "Station" chip', !chips.some(c => /^Station\b/.test(c)));
  const target = await a.textContent('#sName');
  await a.click('#hit'); await a.waitForSelector('#confirm:not(.hidden)', { timeout: 15000 });
  const onTop = await a.evaluate(() => { const r = document.querySelector('#confirm .sheet').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!el.closest('#confirm'); });
  ok('phone: "Ping is in" confirmation is on top and visible', onTop, await a.textContent('#cTitle'));
  await a.screenshot({ path: OUT + '/2-phone-ping-confirm.png' });
  await a.click('#cAgain');
  await a.click('#hit'); await a.waitForTimeout(1500);
  ok('repeat ping on same station is rate-limited', /10 minutes/.test(await a.textContent('#toast')), await a.textContent('#toast'));
  // map tab on phone
  await a.click('[data-tab=map]'); await a.waitForTimeout(2500); await a.screenshot({ path: OUT + '/3-phone-map.png' });
  ok('map tiles are OpenStreetMap', await a.evaluate(() => [...document.images].some(i => /tile\.openstreetmap\.org/.test(i.src))));
  await a.click('[data-tab=feed]'); await a.waitForTimeout(500); await a.screenshot({ path: OUT + '/4-phone-feed.png' });
  ok('feed shows the ping', (await a.textContent('#feed')).includes(target), target);
  await a.click('[data-tab=pizza]'); await a.waitForTimeout(300);
  const pz = await a.innerText('#tab-pizza');
  ok('Pizza of the Week copy', /No purchase or ping needed to be picked/.test(pz) && /Walt picks the winner and contacts them/.test(pz));
  const body = await a.innerText('body');
  ok('no cash / pool / earnings UI', !/(\$\d|cash-out|Request cash|Reporter pool|Your estimate|Drawing entries|Not an investment|Demo books)/i.test(body.replace(/No cash prizes|There is no cash prize/gi, '')));
  await a.fill('#pName', 'QA'); await a.fill('#pContact', 'qa-test@example.com'); await a.click('#pizzaForm button'); await a.waitForTimeout(2000);
  ok('free pizza entry accepted', /in for this week|already entered/.test(await a.textContent('#pizzaMsg')), await a.textContent('#pizzaMsg'));
  await a.screenshot({ path: OUT + '/5-phone-pizza.png', fullPage: true });
  await a.click('[data-tab=ping]'); await a.click('#deskBtn'); await a.waitForTimeout(300);
  ok('Desk has 4-digit code label + explanation', /4 digits/.test(await a.innerText('#desk')) && /station owners and staff/.test(await a.innerText('#desk')));
  await a.fill('#dCode', '0000'); await a.click('#dFix'); await a.waitForTimeout(1500);
  ok('wrong desk code rejected', /doesn't match/.test(await a.textContent('#dMsg')));
  await a.screenshot({ path: OUT + '/6-phone-desk.png' }); await a.click('#deskClose');
  await a.click('#langBtn'); await a.waitForTimeout(300); ok('Spanish toggle', /Cayó combustible/i.test(await a.innerText('#hit')));
  await a.screenshot({ path: OUT + '/7-phone-es.png' });
  ok('no JS errors (phone A)', a.errs.length === 0, a.errs.join('; '));
  // --- Phone B (second device) sees A's ping
  const bp = await ctx(b);
  await bp.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await bp.waitForSelector('.chip', { timeout: 30000 }); await bp.waitForTimeout(2500);
  await bp.click('[data-tab=feed]'); await bp.waitForTimeout(300);
  ok('second phone sees the ping from the server', (await bp.textContent('#feed')).includes(target));
  await bp.screenshot({ path: OUT + '/8-phone2-feed.png' });
  // --- Desktop: confirmation must sit above the visible map (the original bug)
  const d = await ctx(b, { wide: true });
  await d.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await d.waitForSelector('.chip', { timeout: 30000 }); await d.waitForTimeout(1500);
  const chipsD = await d.$$('.chip'); await chipsD[Math.min(3, chipsD.length - 1)].click();
  await d.click('#hit'); await d.waitForSelector('#confirm:not(.hidden)', { timeout: 15000 });
  const topD = await d.evaluate(() => { const r = document.querySelector('#confirm .sheet').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return { top: !!el.closest('#confirm'), centered: Math.abs(r.left + r.width / 2 - innerWidth / 2) < 5 }; });
  ok('desktop: confirmation above the map and centered', topD.top && topD.centered, JSON.stringify(topD));
  await d.screenshot({ path: OUT + '/9-desktop-confirm.png' });
  // --- GPS denied
  const n = await ctx(b, { deny: true });
  await n.goto(BASE + '/', { waitUntil: 'domcontentloaded' }); await n.waitForTimeout(2500); await n.click('#locBtn'); await n.waitForTimeout(2500);
  ok('denied location shows clear message', /blocked|can't/i.test(await n.textContent('#gpsMsg')), await n.textContent('#gpsMsg'));
  await n.screenshot({ path: OUT + '/10-phone-gps-denied.png' });
  await b.close();
  fs.writeFileSync(__dirname + '/RESULTS.json', JSON.stringify({ base: BASE, mock: MOCK, at: new Date().toString(), results }, null, 1));
  const f = results.filter(r => !r.pass).length; console.log(f ? f + ' FAILED' : 'ALL PASS'); process.exit(f ? 1 : 0);
})();
