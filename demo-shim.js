/* FuelWatch static demo mode.
   On hosts without the Netlify backend (e.g. GitHub Pages), /api/* calls are answered in the browser:
   - stations: built-in sample list for the default area; elsewhere the app asks OpenStreetMap directly
   - pings: saved only in this browser (localStorage)
   - geocode: OpenStreetMap Nominatim directly
   - pizza / dispute / desk code: disabled (nothing is collected or sent) */
(function () {
  if (/netlify\.app$/.test(location.hostname) || window.FW_REAL_BACKEND) return;
  var real = window.fetch.bind(window), KEY = "fw_demo_pings";
  var J = function (code, o) { return Promise.resolve(new Response(JSON.stringify(o), { status: code, headers: { "Content-Type": "application/json" } })); };
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  window.FW_DEMO = true;
  window.fetch = function (input, init) {
    var u = typeof input === "string" ? input : (input && input.url) || "";
    if (u.indexOf("/api/") !== 0) return real(input, init);
    var path = u.split("?")[0], qs = new URLSearchParams(u.split("?")[1] || ""), method = (init && init.method) || "GET";
    if (path === "/api/stations") {
      if (qs.get("lat")) return J(200, { center: { lat: +qs.get("lat"), lng: +qs.get("lng"), approx: false }, stations: [] });
      return real("demo-stations.json");
    }
    if (path === "/api/pings") {
      var p = load();
      if (method === "POST") {
        var b = {}; try { b = JSON.parse(init.body); } catch (e) {}
        b.at = Date.now(); delete b.deviceId; p.unshift(b); localStorage.setItem(KEY, JSON.stringify(p.slice(0, 300)));
        return J(200, { ok: true, demo: true });
      }
      return J(200, { pings: p, fixed: {} });
    }
    if (path === "/api/geocode") {
      return real("https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&q=" + encodeURIComponent(qs.get("q") || ""))
        .then(function (r) { return r.json(); })
        .then(function (a) { return J(200, { results: (a || []).map(function (x) { return { lat: +x.lat, lng: +x.lon, label: x.display_name }; }) }); })
        .catch(function () { return J(200, { results: [] }); });
    }
    if (path === "/api/pizza" || path === "/api/dispute") return J(400, { error: "Demo copy: nothing is collected or sent here." });
    if (path === "/api/fixed") return J(403, { error: "code" });
    return J(404, { error: "demo" });
  };
})();
