// FuelWatch backend: Netlify Functions + Netlify Blobs (free tier). No payments, no cash, no prize money.
// Public:  GET /api/pings  POST /api/pings  DELETE /api/pings/:id (own device)  GET /api/stations  GET /api/geocode  POST /api/pizza  POST /api/dispute  POST /api/fixed  GET /api/health
// Owner:   GET /api/admin  (header x-admin-token = env FW_ADMIN_TOKEN)  POST /api/admin {op:'code'|'unfix'|'pizzaDelete', ...}; DELETE /api/pings/:id with the token
// Privacy: device ids, pizza contacts, and dispute contacts are never returned by public routes.
import { getStore } from "@netlify/blobs";

const COOLDOWN_MS = 10 * 60 * 1000;      // one ping per station per phone every 10 minutes
const KEEP_MS = 90 * 24 * 3600 * 1000;   // keep 90 days of pings
const MAX_PINGS = 20000;
const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.osm.jp/api/interpreter"];
const UA = "FuelWatch/1.0 (fuel spill reporting; netlify)";
const DEV = /^[a-z0-9]{8,64}$/i;

const json = (code, o, extra = {}) => new Response(JSON.stringify(o), { status: code, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...extra } });
const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
const num = (v) => { if (v === null || v === undefined || v === "") return null; const x = Number(v); return Number.isFinite(x) ? x : null; };
const rid = () => crypto.randomUUID().replace(/-/g, "");
const pub = (p) => ({ id: p.id, stationId: p.stationId, stationName: p.stationName, address: p.address, lat: p.lat, lng: p.lng, note: p.note, at: p.at, fixedAt: p.fixedAt || null });

async function update(store, key, fn) {           // compare-and-swap on one JSON blob
  for (let i = 0; i < 8; i++) {
    const cur = await store.getWithMetadata(key, { type: "json" });
    const data = cur?.data ?? null;
    const { next, result } = await fn(data);
    if (next === undefined) return result;
    const r = cur ? await store.setJSON(key, next, { onlyIfMatch: cur.etag }) : await store.setJSON(key, next, { onlyIfNew: true });
    if (!r || r.modified !== false) return result;
    await new Promise((s) => setTimeout(s, 40 + Math.random() * 120));
  }
  throw new Error("busy");
}

function stationFrom(el) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) return null;
  const brand = clean(t.brand || t.operator || "", 60);
  const name = clean(t.name || "", 60);
  const street = clean([t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "), 80);
  const city = clean(t["addr:city"] || "", 40);
  return { id: `${el.type}/${el.id}`, brand, name, street, city, lat: +lat.toFixed(6), lng: +lng.toFixed(6) };
}

async function overpass(lat, lng, radius) {
  const dLat = radius / 111320, dLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  const bb = `${(lat - dLat).toFixed(4)},${(lng - dLng).toFixed(4)},${(lat + dLat).toFixed(4)},${(lng + dLng).toFixed(4)}`;
  const q = `[out:json][timeout:9][bbox:${bb}];nwr["amenity"="fuel"];out center 120;`;
  // Ask all mirrors at once and take the first good answer (Netlify functions time out at ~10 s).
  const ctl = new AbortController();
  const one = async (url) => {
    const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA }, signal: AbortSignal.any([ctl.signal, AbortSignal.timeout(9000)]) });
    if (!r.ok) throw new Error("overpass " + r.status);
    const j = await r.json();
    if (!Array.isArray(j.elements)) throw new Error("overpass bad");
    return j.elements.map(stationFrom).filter(Boolean);
  };
  try { const out = await Promise.any(OVERPASS.map(one)); ctl.abort(); return out; }
  catch (e) { throw new Error("overpass unavailable: " + (e.errors || [e]).map((x) => String(x?.message || x)).join(" | ")); }
}

export default async (req, context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/\/+$/, "").split("/").slice(2); // after /api
  const route = parts[0] || "";
  let store;
  try { store = getStore({ name: "fuelwatch", consistency: "strong" }); } catch (e) { return json(503, { error: "storage not configured" }); }
  const admin = !!process.env.FW_ADMIN_TOKEN && req.headers.get("x-admin-token") === process.env.FW_ADMIN_TOKEN;
  try {
    if (route === "health") { await store.get("pings"); return json(200, { ok: true }); }

    if (route === "pings" && req.method === "GET") {
      const since = num(url.searchParams.get("since")) || 0;
      const all = (await store.get("pings", { type: "json" })) || [];
      const fixed = (await store.get("fixed", { type: "json" })) || {};
      const out = all.filter((p) => p.at > since).map((p) => pub({ ...p, fixedAt: fixed[p.stationId] && fixed[p.stationId] >= p.at ? fixed[p.stationId] : null }));
      return json(200, { pings: out.slice(-3000).reverse(), fixed, now: Date.now() });
    }

    if (route === "pings" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const deviceId = clean(b.deviceId, 64);
      const stationId = clean(b.stationId, 40);
      if (!DEV.test(deviceId)) return json(400, { error: "device" });
      if (!/^(node|way|relation)\/\d+$/.test(stationId)) return json(400, { error: "station" });
      const lat = num(b.lat), lng = num(b.lng);
      if (lat == null || lng == null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return json(400, { error: "location" });
      const now = Date.now();
      const p = { id: clean(b.id, 40) || rid(), deviceId, stationId, stationName: clean(b.stationName, 60) || "Gas station", address: clean(b.address, 100), lat: +lat.toFixed(5), lng: +lng.toFixed(5), note: clean(b.note, 200), at: now };
      const res = await update(store, "pings", async (all) => {
        all = (all || []).filter((x) => now - x.at < KEEP_MS);
        if (all.some((x) => x.id === p.id)) return { next: undefined, result: { dup: true } };            // offline retry: already saved
        const recent = all.find((x) => x.deviceId === deviceId && x.stationId === stationId && now - x.at < COOLDOWN_MS);
        if (recent) return { next: undefined, result: { rate: true, retryAt: recent.at + COOLDOWN_MS } };
        const perHour = all.filter((x) => x.deviceId === deviceId && now - x.at < 3600e3).length;
        if (perHour >= 20) return { next: undefined, result: { rate: true, retryAt: now + 600e3 } };
        all.push(p); if (all.length > MAX_PINGS) all = all.slice(-MAX_PINGS);
        return { next: all, result: { ok: true } };
      });
      if (res.rate) return json(429, { error: "rate", retryAt: res.retryAt });
      return json(200, { ok: true, ping: pub(p) });
    }

    if (route === "pings" && req.method === "DELETE" && parts[1]) {
      const id = clean(parts[1], 40); const deviceId = clean(url.searchParams.get("deviceId"), 64);
      const res = await update(store, "pings", async (all) => {
        all = all || []; const i = all.findIndex((x) => x.id === id && (admin || (deviceId && x.deviceId === deviceId)));
        if (i < 0) return { next: undefined, result: false }; all.splice(i, 1); return { next: all, result: true };
      });
      return res ? json(200, { ok: true }) : json(404, { error: "not found" });
    }

    if (route === "stations") {
      let lat = num(url.searchParams.get("lat")), lng = num(url.searchParams.get("lng")), approx = false;
      if (lat == null || lng == null) {                                   // no GPS: use Netlify's IP-based location, else Chattanooga
        const g = context?.geo || {};
        lat = num(g.latitude); lng = num(g.longitude); approx = true;
        if (lat == null || lng == null || (lat === 0 && lng === 0)) { lat = 35.0456; lng = -85.3097; }
      }
      const radius = Math.min(Math.max(num(url.searchParams.get("r")) || 8000, 1000), 20000);
      const key = `st/${lat.toFixed(2)},${lng.toFixed(2)},${radius}`;
      const cached = await store.get(key, { type: "json" });
      let stations = cached && Date.now() - cached.at < 24 * 3600e3 ? cached.stations : null;
      if (!stations) {
        try { stations = await overpass(lat, lng, radius); if (stations.length) await store.setJSON(key, { at: Date.now(), stations }); }
        catch (e) { console.log("stations", e.message); if (cached) stations = cached.stations; else return json(502, { error: "Station lookup is busy. Try again in a minute.", center: { lat, lng, approx, city: context?.geo?.city || null }, detail: url.searchParams.get("debug") ? e.message : undefined }); }
      }
      return json(200, { center: { lat, lng, approx, city: context?.geo?.city || null }, stations }, { "Cache-Control": "public, max-age=300", "Netlify-Vary": "query" });
    }

    if (route === "geocode") {
      const q = clean(url.searchParams.get("q"), 120);
      if (q.length < 2) return json(400, { error: "q" });
      const key = "geo/" + q.toLowerCase();
      const cached = await store.get(key, { type: "json" });
      if (cached) return json(200, cached);
      const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&q=" + encodeURIComponent(q), { headers: { "User-Agent": UA, Referer: url.origin }, signal: AbortSignal.timeout(9000) });
      if (!r.ok) return json(502, { error: "search busy" });
      const results = (await r.json()).map((x) => ({ lat: +x.lat, lng: +x.lon, label: clean(x.display_name, 140) }));
      await store.setJSON(key, { results });
      return json(200, { results });
    }

    if (route === "pizza" && req.method === "POST") {      // Pizza of the Week: free entry, no purchase or ping needed. Contact stays private.
      const b = await req.json().catch(() => ({}));
      const name = clean(b.name, 40), contact = clean(b.contact, 80), deviceId = clean(b.deviceId, 64);
      if (!name || contact.length < 5) return json(400, { error: "Add your first name and a phone or email." });
      const day = new Date().toISOString().slice(0, 10);
      const res = await update(store, "pizza", async (all) => {
        all = (all || []).filter((x) => Date.now() - x.at < 60 * 24 * 3600e3);
        if (all.some((x) => x.day === day && (x.contact.toLowerCase() === contact.toLowerCase() || (deviceId && x.deviceId === deviceId)))) return { next: undefined, result: "dup" };
        all.push({ id: rid(), name, contact, deviceId, day, at: Date.now() }); return { next: all, result: "ok" };
      });
      return res === "dup" ? json(200, { ok: true, already: true }) : json(200, { ok: true });
    }

    if (route === "dispute" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      const d = { id: rid(), stationId: clean(b.stationId, 40), stationName: clean(b.stationName, 60), message: clean(b.message, 600), contact: clean(b.contact, 80), at: Date.now() };
      if (!d.stationId || d.message.length < 5) return json(400, { error: "Pick a station and say what's wrong." });
      await update(store, "disputes", async (all) => ({ next: [...(all || []), d].slice(-2000), result: true }));
      return json(200, { ok: true });
    }

    if (route === "fixed" && req.method === "POST") {      // station staff mark fixed with a 4-digit code the owner set for that station
      const b = await req.json().catch(() => ({}));
      const stationId = clean(b.stationId, 40), code = clean(b.code, 8);
      const codes = (await store.get("codes", { type: "json" })) || {};
      if (!admin && (!/^\d{4}$/.test(code) || codes[stationId] !== code)) return json(403, { error: "code" });
      const at = Date.now();
      await update(store, "fixed", async (m) => ({ next: { ...(m || {}), [stationId]: at }, result: true }));
      return json(200, { ok: true, fixedAt: at });
    }

    if (route === "admin") {
      if (!admin) return json(401, { error: "admin token required" });
      if (req.method === "GET") {
        const [pings, pizza, disputes, codes, fixed] = await Promise.all(["pings", "pizza", "disputes", "codes", "fixed"].map((k) => store.get(k, { type: "json" })));
        const p = pings || []; const wk = Date.now() - 7 * 24 * 3600e3;
        const activeDevices = new Set(p.filter((x) => x.at > wk).map((x) => x.deviceId));
        return json(200, { totals: { pings: p.length, pings7d: p.filter((x) => x.at > wk).length, phones7d: activeDevices.size, stations: new Set(p.map((x) => x.stationId)).size }, pizza: pizza || [], disputes: disputes || [], codes: codes || {}, fixed: fixed || {} });
      }
      const b = await req.json().catch(() => ({}));
      if (b.op === "code") { const sid = clean(b.stationId, 40), c = clean(b.code, 4); if (!/^\d{4}$/.test(c)) return json(400, { error: "4 digits" }); await update(store, "codes", async (m) => ({ next: { ...(m || {}), [sid]: c }, result: 1 })); return json(200, { ok: true }); }
      if (b.op === "unfix") { await update(store, "fixed", async (m) => { m = { ...(m || {}) }; delete m[clean(b.stationId, 40)]; return { next: m, result: 1 }; }); return json(200, { ok: true }); }
      if (b.op === "pizzaDelete") { const id = clean(b.id, 40); await update(store, "pizza", async (m) => ({ next: (m || []).filter((x) => x.id !== id), result: 1 })); return json(200, { ok: true }); }
      return json(400, { error: "op" });
    }
    return json(404, { error: "not found" });
  } catch (e) {
    return json(503, { error: String(e?.message || e) });
  }
};
export const config = { path: ["/api/*"] };
