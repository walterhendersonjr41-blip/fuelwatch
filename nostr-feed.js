// Free shared storage on public Nostr relays (no account, no server). Usage:
//   await NostrFeed.ready; await NostrFeed.put(appTag, id, obj); const list = await NostrFeed.query(appTag, 300);
// Everything posted is PUBLIC. Never post names, phones, addresses of people, or other personal info.
import { generateSecretKey, getPublicKey, finalizeEvent, SimplePool, bytesToHex, hexToBytes } from './nostr.bundle.js';
const KIND = 30078;
const RELAYS = ['wss://nos.lol', 'wss://relay.primal.net', 'wss://nostr.mom', 'wss://offchain.pub', 'wss://relay.snort.social'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let hex = localStorage.getItem('nf-sk');
if (!/^[0-9a-f]{64}$/.test(hex || '')) { hex = bytesToHex(generateSecretKey()); localStorage.setItem('nf-sk', hex); }
const SK = hexToBytes(hex), PK = getPublicKey(SK);
const pool = new SimplePool();
function parse(e) { let c = {}; try { c = JSON.parse(e.content); } catch (x) {} const d = (e.tags.find(t => t[0] === 'd') || [])[1] || e.id; return Object.assign({}, c, { _id: d, _by: e.pubkey, _mine: e.pubkey === PK, _at: e.created_at * 1000 }); }
window.NostrFeed = {
  me: PK,
  async put(tag, d, content) {
    const ev = finalizeEvent({ kind: KIND, created_at: Math.floor(Date.now() / 1000), tags: [['d', tag + ':' + d], ['t', tag]], content: JSON.stringify(content) }, SK);
    const rs = await Promise.allSettled(pool.publish(RELAYS, ev).map(p => Promise.race([p, sleep(9000).then(() => { throw new Error('timeout'); })])));
    if (!rs.some(r => r.status === 'fulfilled')) throw new Error('offline');
    return parse(ev);
  },
  async query(tag, limit) {
    const evs = await pool.querySync(RELAYS, { kinds: [KIND], '#t': [tag], limit: limit || 300 }, { maxWait: 4500 });
    const latest = new Map();
    evs.forEach(e => { const p = parse(e), k = e.pubkey + '|' + p._id; const o = latest.get(k); if (!o || p._at > o._at) latest.set(k, p); });
    return [...latest.values()].sort((a, b) => b._at - a._at);
  }
};
window.dispatchEvent(new Event('nostrfeed-ready'));
