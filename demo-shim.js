/* FuelWatch on static hosting (GitHub Pages).
   Without the Netlify backend, /api/* calls are answered in the browser:
   - stations: real OpenStreetMap stations (saved OSM copy for Chattanooga, live Overpass lookup elsewhere)
   - pings: saved on this phone AND shared on free public Nostr relays, so every phone sees the same live map
   - geocode: OpenStreetMap Nominatim directly
   - pizza / dispute / desk code: disabled (nothing is collected or sent) */
(function () {
  if (/netlify\.app$/.test(location.hostname) || window.FW_REAL_BACKEND) return;
  var real = window.fetch.bind(window), KEY = "fw_demo_pings";
  var TAG = /[?&]ns=test/.test(location.search) ? "fuelwatch-ping-test" : "fuelwatch-ping"; // test pings stay out of the public map
  var J = function (code, o) { return Promise.resolve(new Response(JSON.stringify(o), { status: code, headers: { "Content-Type": "application/json" } })); };
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  window.FW_DEMO = true;
  var feedP = null;
  function feed() {
    if (!feedP) feedP = new Promise(function (res, rej) {
      if (window.NostrFeed) return res(window.NostrFeed);
      addEventListener("nostrfeed-ready", function () { res(window.NostrFeed); });
      var sc = document.createElement("script"); sc.type = "module"; sc.src = "nostr-feed.js"; sc.onerror = rej; document.head.appendChild(sc);
      setTimeout(function () { rej(new Error("slow")); }, 8000);
    });
    return feedP;
  }
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : (input && input.url) || "";
    if (u.indexOf("/api/") !== 0) return real(input, init);
    var path = u.split("?")[0], qs = new URLSearchParams(u.split("?")[1] || ""), method = (init && init.method) || "GET";
    if (path === "/api/stations") {
      if (qs.get("lat")) {
        var la = +qs.get("lat"), lo = +qs.get("lng"), ctr = { lat: la, lng: lo, approx: false };
        // Inside the saved sample area (Chattanooga) answer instantly; elsewhere the app asks OpenStreetMap directly.
        if (Math.abs(la - 35.0456) < 0.15 && Math.abs(lo + 85.3097) < 0.18)
          return real("demo-stations.json").then(function (r) { return r.json(); }).then(function (j) { return J(200, { center: ctr, stations: j.stations || [] }); }).catch(function () { return J(200, { center: ctr, stations: [] }); });
        return J(200, { center: ctr, stations: [] });
      }
      return real("demo-stations.json");
    }
    if (path === "/api/pings") {
      var p = load();
      if (method === "POST") {
        var b = {}; try { b = JSON.parse(init.body); } catch (e) {}
        b.at = Date.now(); delete b.deviceId; p.unshift(b); localStorage.setItem(KEY, JSON.stringify(p.slice(0, 300)));
        // Share it on the free public map (Nostr relays). Only station + note, never who sent it.
        feed().then(function (F) { return F.put(TAG, b.id || String(b.at), { id: b.id, stationId: b.stationId, stationName: String(b.stationName || "").slice(0, 60), address: String(b.address || "").slice(0, 100), lat: b.lat, lng: b.lng, note: String(b.note || "").slice(0, 200), at: b.at }); }).catch(function () {});
        return J(200, { ok: true });
      }
      return feed().then(function (F) { return Promise.race([F.query(TAG, 400), new Promise(function (r) { setTimeout(function () { r([]); }, 7000); })]); })
        .catch(function () { return []; })
        .then(function (shared) {
          var seen = {}, all = [];
          p.concat(shared || []).forEach(function (x) { var k = x.id || (x.stationId + x.at); if (!x || !x.stationId || seen[k] || /automated check/i.test(x.note || "")) return; seen[k] = 1; all.push({ id: x.id, stationId: x.stationId, stationName: x.stationName, address: x.address, lat: +x.lat, lng: +x.lng, note: x.note || "", at: +x.at || x._at }); });
          all.sort(function (a, c) { return c.at - a.at; });
          return J(200, { pings: all.slice(0, 500), fixed: {} });
        });
    }
    if (path === "/api/geocode") {
      return real("https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&q=" + encodeURIComponent(qs.get("q") || ""))
        .then(function (r) { return r.json(); })
        .then(function (a) { return J(200, { results: (a || []).map(function (x) { return { lat: +x.lat, lng: +x.lon, label: x.display_name }; }) }); })
        .catch(function () { return J(200, { results: [] }); });
    }
    if (path === "/api/pizza" || path === "/api/dispute") return J(400, { error: "Not available yet: this needs the FuelWatch server. Nothing was sent." });
    if (path === "/api/fixed") return J(403, { error: "code" });
    return J(404, { error: "demo" });
  };
})();
