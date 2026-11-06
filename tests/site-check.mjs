import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const pages = fs.readdirSync('public').filter(p => p.endsWith('.html'));
for (const page of pages) {
 const html = fs.readFileSync('public/' + page, 'utf8');
 for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
  const path = decodeURIComponent(match[1]);
  assert(path === '/' || fs.existsSync('public' + path) || fs.existsSync('public' + path + '.html'), `${page}: broken local link ${path}`);
 }
 assert(html.includes('/js/main.js'), `${page}: missing shared script`);
 assert(html.includes('href="/privacy"'), `${page}: missing privacy link`);
}
const script = fs.readFileSync('public/js/main.js', 'utf8');
async function scenario({ok = true, statusOK = true, reject = false, granted = true, configured = true} = {}) {
 let submit, click, reset = 0, fetches = 0;
 const status = {dataset: {}, textContent: ''};
 const button = {};
 const form = {action: 'https://formspree.io/f/movkqzzb', reportValidity: () => true,
  querySelector: s => s === '[type="submit"]' ? button : status,
  addEventListener: (_, fn) => { submit = fn; }, reset: () => reset++};
 const appended = [];
 const document = {referrer: '', head: {appendChild: s => appended.push(s)}, body: {appendChild(){}},
  querySelector: () => null, querySelectorAll: () => [form],
  addEventListener: (_, fn) => {click = fn;},
  createElement: () => ({addEventListener(){}})};
 const window = {CK_TRACKING: configured ? {googleAdsId: 'AW-123456789', ga4Id: 'G-TEST123', conversionLabels:{lead:'leadLabel'}} : {},
  fetch: true, FormData: true};
 const context = {window, document, location: {origin: 'https://www.ckupholstery.co.uk', pathname: '/contact'},
  localStorage: {getItem: () => granted ? 'granted' : 'denied', setItem(){}}, URL,
  FormData: class {}, AbortController, setTimeout, clearTimeout,
  fetch: async () => {fetches++; if(reject) throw Error('network'); return {ok:statusOK,json:async()=>({ok})};}};
 vm.runInNewContext(script, context);
 const event = {preventDefault(){}};
 const first = submit(event); const second = submit(event);
 await Promise.all([first, second]);
 return {events:window.dataLayer.filter(e=>e[0]==='event'), status, reset, fetches, appended, click};
}
let result = await scenario();
assert.equal(result.fetches,1,'double submits blocked');
assert.equal(result.reset,1);
assert.equal(result.events.filter(e=>e[1]==='conversion').length,1);
for(const options of [{ok:false},{statusOK:false},{reject:true}]) {
 result = await scenario(options);
 assert.equal(result.events.length,0,'failures must never count as leads');
 assert.equal(result.reset,0,'failed forms retain values');
 assert.equal(result.status.dataset.state,'error');
}
for (const options of [{granted:false},{configured:false}]) {
 result = await scenario(options);
 assert.equal(result.events.length,0);
 assert.equal(result.appended.length,0,'no Google script without consent and IDs');
 assert.equal(result.status.dataset.state,'success','forms work without tracking');
}
console.log(`PASS: local links across ${pages.length} pages; form success, failure, duplicate prevention, consent gating and conversion rules.`);
