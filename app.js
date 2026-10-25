/* FuelWatch client. Shared pings live on the server (/api/pings). No cash, no payments. */
(function () {
  "use strict";
  var T = {
    en: { desk:"Desk", note:"Note", optional:"Optional", hit:"Fuel hit the ground", hitSub:"Ping it", nearest:"Station you're pinging", useLoc:"Use my location",
      book:"Nearby", find:"Find", searchPh:"Station name, address or city", nrc:"National Response Center",
      nrcBody:"A large spill can be an emergency. Call 1-800-424-8802. FuelWatch is not 911 and not the fire department. If there is fire or danger, call 911.",
      callNrc:"Call 1-800-424-8802", ping:"Ping", map:"Map", feed:"Feed", pizza:"Pizza", feedTitle:"Recent pings, all phones",
      noFeed:"No spills reported nearby yet. Be the first: tap the yellow button when fuel hits the ground.",
      pizzaTitle:"Pizza of the Week",
      pizzaBody1:"Every week, Walt buys one active FuelWatch reporter a pizza. That's it: a thank-you for keeping stations honest.",
      pizzaBody2:"No purchase or ping needed to be picked. Use the free entry below. Walt picks the winner and contacts them.",
      pizzaBody3:"No cash prizes, no points-for-money. Your pings are free and stay anonymous on the map.",
      freeEntry:"Free entry", enter:"Enter this week", namePh:"First name", contactPh:"Phone or email (so Walt can reach you)",
      pizzaPrivate:"Your name and contact are private. They never show on the map or feed. One entry per day.",
      pizzaOk:"You're in for this week's pizza. Good luck!", pizzaAgain:"You already entered today. You're still in.",
      yourPings:"Your pings on this phone", streak:"Day streak: ", pizzaRules:"How Pizza of the Week works", terms:"Terms", privacy:"Privacy",
      again:"Ping another", saved:"Ping is in.", offline:"Saved on this phone. It sends when you're back online.", rate:"This station already has your ping. Give it 10 minutes.",
      needStation:"Pick a station first.", live:"Live", quiet:"Quiet", fixed:"Cleaned up", drop:"drop", drops:"drops", today:"today", inLast:"in the last 24 h",
      gpsSeek:"Looking for this phone…", gpsLock:"GPS locked", gpsDenied:"Location is blocked. Allow location for this site in your browser settings, or search a station below.",
      gpsNo:"This phone can't share location. Search a station below.", gpsFail:"Couldn't get a GPS fix. Try again outside, or search below.",
      approx:"Approximate area. Tap Use my location for exact.", loading:"Looking up stations…", none:"No stations found here. Try a city or a street.", busy:"Station lookup is busy. Try again in a minute.",
      deskTitle:"Station desk", close:"Close", deskWhat:"For station owners and staff. See every ping at your station, and mark a spill cleaned up with your 4-digit station code. Reports stay public; this is never a fee to take one down.",
      codeLabel:"Station staff code (4 digits)", codePh:"4-digit code", markFixed:"Mark cleaned up", wrong:"That code doesn't match this station. Ask FuelWatch for your station's code.",
      fixedOk:"Marked cleaned up. Thanks.", dispute:"Station dispute", disputePh:"What's wrong with a report at your station?", disputeContact:"How to reach you (optional)",
      send:"Send dispute", disputeOk:"Dispute sent. A person reviews it.", pitch:"Station desk codes are free while FuelWatch is new.",
      hist7:"Last 7 days: ", hist30:" · last 30 days: ", lastPing:" · last ping ", justNow:"just now", ago:" ago", mi:"mi", where:"Anywhere", gasStation:"Gas station", noteBtn:"Note", notePh:"What do you see? No names, no plates." },
    es: { desk:"Mesa", note:"Nota", optional:"Opcional", hit:"Cayó combustible al suelo", hitSub:"Avísalo", nearest:"Estación que reportas", useLoc:"Usar mi ubicación",
      book:"Cerca", find:"Buscar", searchPh:"Nombre, dirección o ciudad", nrc:"Centro Nacional de Respuesta",
      nrcBody:"Un derrame grande puede ser una emergencia. Llama al 1-800-424-8802. FuelWatch no es el 911 ni los bomberos. Si hay fuego o peligro, llama al 911.",
      callNrc:"Llamar 1-800-424-8802", ping:"Aviso", map:"Mapa", feed:"Lista", pizza:"Pizza", feedTitle:"Avisos recientes, todos los teléfonos",
      noFeed:"Todavía no hay derrames reportados cerca. Sé el primero: toca el botón amarillo cuando caiga combustible.",
      pizzaTitle:"Pizza de la Semana",
      pizzaBody1:"Cada semana, Walt le compra una pizza a un reportero activo de FuelWatch. Es un simple agradecimiento.",
      pizzaBody2:"No se necesita compra ni aviso para ser elegido. Usa la entrada gratis abajo. Walt elige al ganador y se comunica con él.",
      pizzaBody3:"Sin premios en efectivo. Tus avisos son gratis y anónimos en el mapa.",
      freeEntry:"Entrada gratis", enter:"Participar esta semana", namePh:"Nombre", contactPh:"Teléfono o correo (para que Walt te contacte)",
      pizzaPrivate:"Tu nombre y contacto son privados. Nunca aparecen en el mapa ni en la lista. Una entrada por día.",
      pizzaOk:"Estás participando por la pizza de esta semana. ¡Suerte!", pizzaAgain:"Ya participaste hoy. Sigues dentro.",
      yourPings:"Tus avisos en este teléfono", streak:"Días seguidos: ", pizzaRules:"Cómo funciona la Pizza de la Semana", terms:"Términos", privacy:"Privacidad",
      again:"Otro aviso", saved:"Aviso enviado.", offline:"Guardado en este teléfono. Se envía cuando vuelva la señal.", rate:"Esta estación ya tiene tu aviso. Espera 10 minutos.",
      needStation:"Elige una estación primero.", live:"Activo", quiet:"Tranquilo", fixed:"Limpiado", drop:"aviso", drops:"avisos", today:"hoy", inLast:"en las últimas 24 h",
      gpsSeek:"Buscando este teléfono…", gpsLock:"GPS fijo", gpsDenied:"La ubicación está bloqueada. Permítela para este sitio en tu navegador, o busca una estación abajo.",
      gpsNo:"Este teléfono no comparte ubicación. Busca una estación abajo.", gpsFail:"No se pudo obtener GPS. Intenta afuera o busca abajo.",
      approx:"Zona aproximada. Toca Usar mi ubicación.", loading:"Buscando estaciones…", none:"No se encontraron estaciones. Prueba una ciudad o calle.", busy:"La búsqueda está ocupada. Intenta en un minuto.",
      deskTitle:"Mesa de la estación", close:"Cerrar", deskWhat:"Para dueños y personal de estaciones. Mira cada aviso en tu estación y marca un derrame como limpiado con tu código de 4 dígitos. Los reportes siguen públicos; nunca es un pago para quitarlos.",
      codeLabel:"Código del personal (4 dígitos)", codePh:"Código de 4 dígitos", markFixed:"Marcar limpiado", wrong:"Ese código no corresponde a esta estación.",
      fixedOk:"Marcado como limpiado. Gracias.", dispute:"Disputa de la estación", disputePh:"¿Qué está mal con un reporte en tu estación?", disputeContact:"Cómo contactarte (opcional)",
      send:"Enviar disputa", disputeOk:"Disputa enviada. Una persona la revisa.", pitch:"Los códigos de la mesa son gratis mientras FuelWatch es nuevo.",
      hist7:"Últimos 7 días: ", hist30:" · últimos 30 días: ", lastPing:" · último aviso hace ", justNow:"ahora", ago:"", mi:"mi", where:"En cualquier lugar", gasStation:"Gasolinera", noteBtn:"Nota", notePh:"¿Qué ves? Sin nombres ni placas." }
  };
  var $ = function (id) { return document.getElementById(id); };
  var LS = "fuelwatch-netlify-v1";
  var S = load();
  var lang = S.lang || ((navigator.language || "").slice(0, 2) === "es" ? "es" : "en");
  var t = function (k) { return (T[lang] && T[lang][k]) || T.en[k] || k; };
  var stations = [], pings = [], fixedMap = {}, selected = null, origin = null, gpsOn = false, map = null, markers = null, mapCenterLoaded = null;

  function load() { try { var s = JSON.parse(localStorage.getItem(LS) || "{}"); if (!s.deviceId) s.deviceId = rand(); s.queue = s.queue || []; s.mine = s.mine || []; return s; } catch (e) { return { deviceId: rand(), queue: [], mine: [] }; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
  function rand() { var a = new Uint8Array(12); crypto.getRandomValues(a); return "d" + Array.from(a, function (b) { return b.toString(36).padStart(2, "0"); }).join("").slice(0, 20); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(m) { var el = $("toast"); el.textContent = m; el.classList.remove("hidden"); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.add("hidden"); }, 3500); }
  function miles(a, b) { var R = 3958.8, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r; var x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
  function compass(a, b) { var y = Math.sin((b.lng - a.lng) * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180), x = Math.cos(a.lat * Math.PI / 180) * Math.sin(b.lat * Math.PI / 180) - Math.sin(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.cos((b.lng - a.lng) * Math.PI / 180); var d = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360; return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8]; }
  function ago(ms) { var s = (Date.now() - ms) / 1000; if (s < 60) return t("justNow"); var m = s / 60; var v = m < 60 ? Math.round(m) + " min" : m < 1440 ? Math.round(m / 60) + " h" : Math.round(m / 1440) + " d"; return lang === "es" ? "hace " + v : v + t("ago"); }
  var GENERIC = /^(gas ?station|station|fuel|gas|gasolinera|petrol station)$/i;
  function title(s) { var n = s.name && !GENERIC.test(s.name) ? s.name : ""; return n || s.brand || t("gasStation"); }
  function subLine(s) { var bits = []; if (s.brand && title(s) !== s.brand) bits.push(s.brand); if (s.street) bits.push(s.street); if (s.city) bits.push(s.city); return bits.join(" · "); }
  function distLabel(s) { if (!origin) return ""; return miles(origin, s).toFixed(1) + " " + t("mi") + " " + compass(origin, s); }
  function counts(id) { var now = Date.now(), fx = fixedMap[id] || 0, c24 = 0, c7 = 0, c30 = 0, last = 0; pings.forEach(function (p) { if (p.stationId !== id) return; var a = now - p.at; if (a < 864e5 && p.at > fx) c24++; if (a < 6048e5) c7++; if (a < 2592e6) c30++; if (p.at > last) last = p.at; }); return { c24: c24, c7: c7, c30: c30, last: last, fixed: fx }; }
  function dropWord(n) { return n + " " + (n === 1 ? t("drop") : t("drops")); }

  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-t]").forEach(function (el) { el.textContent = t(el.getAttribute("data-t")); });
    $("langBtn").textContent = lang === "en" ? "ES" : "EN";
    $("q").placeholder = t("searchPh"); $("note").placeholder = t("notePh"); $("pName").placeholder = t("namePh"); $("pContact").placeholder = t("contactPh");
    $("dText").placeholder = t("disputePh"); $("dContact").placeholder = t("disputeContact"); $("dCode").placeholder = t("codePh");
    renderAll();
  }

  /* ---------- stations ---------- */
  // Server first (cached 24h for everyone). If the free OSM lookup is slow from the server,
  // the phone asks OpenStreetMap's Overpass directly (it allows browser requests) with a longer wait.
  function overpassDirect(lat, lng) {
    var r = 8000, dLat = r / 111320, dLng = r / (111320 * Math.cos(lat * Math.PI / 180));
    var bb = [(lat - dLat).toFixed(4), (lng - dLng).toFixed(4), (lat + dLat).toFixed(4), (lng + dLng).toFixed(4)].join(",");
    var q = "[out:json][timeout:25][bbox:" + bb + "];nwr[\"amenity\"=\"fuel\"];out center 120;";
    var mirrors = ["https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
    function one(u) {
      return fetch(u, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" } })
        .then(function (x) { if (!x.ok) throw new Error("op"); return x.json(); })
        .then(function (j) { if (!j || !Array.isArray(j.elements) || !j.elements.length) throw new Error("op"); return j.elements; });
    }
    return new Promise(function (res, rej) { var n = mirrors.length; mirrors.forEach(function (u) { one(u).then(res, function () { if (--n === 0) rej(new Error("busy")); }); }); })
      .then(function (els) {
        var cl = function (v, n) { return String(v || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n); };
        return els.map(function (el) {
          var tg = el.tags || {}, la = el.lat != null ? el.lat : el.center && el.center.lat, lo = el.lon != null ? el.lon : el.center && el.center.lon;
          if (la == null || lo == null) return null;
          return { id: el.type + "/" + el.id, brand: cl(tg.brand || tg.operator, 60), name: cl(tg.name, 60), street: cl([tg["addr:housenumber"], tg["addr:street"]].filter(Boolean).join(" "), 80), city: cl(tg["addr:city"], 40), lat: +(+la).toFixed(6), lng: +(+lo).toFixed(6) };
        }).filter(Boolean);
      });
  }
  function fetchStations(qs, lat, lng) {
    return fetch("/api/stations" + qs).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok && j.stations && j.stations.length) return j;
        var c = j.center || (lat != null ? { lat: lat, lng: lng, approx: false } : { lat: 35.0456, lng: -85.3097, approx: true });
        return overpassDirect(c.lat, c.lng).then(function (st) { return { center: c, stations: st }; });
      });
    });
  }
  function loadStations(lat, lng, why) {
    var qs = lat != null ? "?lat=" + lat.toFixed(4) + "&lng=" + lng.toFixed(4) : "";
    $("chips").innerHTML = '<span class="small mute">' + esc(t("loading")) + "</span>";
    return fetchStations(qs, lat, lng).then(function (j) {
      if (!why) origin = { lat: j.center.lat, lng: j.center.lng };
      mapCenterLoaded = { lat: j.center.lat, lng: j.center.lng };
      if (j.center.approx && !gpsOn) $("gpsMsg").textContent = t("approx") + (j.center.city ? " (" + j.center.city + ")" : "");
      var seen = {}; stations = j.stations.filter(function (s) { if (seen[s.id]) return false; seen[s.id] = 1; return true; });
      var ref = origin; stations.sort(function (a, b) { return miles(ref, a) - miles(ref, b); });
      if (!selected || why === "gps" || why === "search") selected = stations[0] || null;
      if (map) { map.setView([ref.lat, ref.lng], 13); }
      renderAll();
    }).catch(function () { $("chips").innerHTML = '<span class="small mute">' + esc(t("busy")) + "</span>"; });
  }
  function useLocation(auto) {
    if (!navigator.geolocation) { $("gpsMsg").textContent = t("gpsNo"); if (auto) loadStations(); return; }
    $("gpsMsg").textContent = t("gpsSeek");
    navigator.geolocation.getCurrentPosition(function (pos) {
      gpsOn = true; origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      $("gpsMsg").textContent = t("gpsLock") + " ±" + Math.round(pos.coords.accuracy) + " m";
      loadStations(origin.lat, origin.lng, "gps");
    }, function (err) {
      $("gpsMsg").textContent = err && err.code === 1 ? t("gpsDenied") : t("gpsFail");
      if (auto || !stations.length) loadStations();
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  }

  /* ---------- pings ---------- */
  function refreshPings() {
    return fetch("/api/pings").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (!j) return; pings = j.pings || []; fixedMap = j.fixed || {}; renderAll(); }).catch(function () {});
  }
  function flush() {
    if (!S.queue.length || !navigator.onLine) return Promise.resolve();
    var p = S.queue[0];
    return fetch("/api/pings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).then(function (r) {
      if (r.ok || r.status === 429 || r.status === 400) { S.queue.shift(); save(); return flush(); }
    }).catch(function () {});
  }
  function doPing() {
    if (!selected) { toast(t("needStation")); return; }
    var s = selected, now = Date.now();
    var recent = S.mine.find(function (m) { return m.stationId === s.id && now - m.at < 6e5; });
    if (recent) { toast(t("rate")); return; }
    var body = { id: rand().slice(1) + now.toString(36), deviceId: S.deviceId, stationId: s.id, stationName: title(s), address: [s.street, s.city].filter(Boolean).join(", "), lat: s.lat, lng: s.lng, note: $("note").value.trim() };
    $("hit").disabled = true;
    var done = function (ok, offline) {
      $("hit").disabled = false;
      if (!ok) return;
      S.mine.push({ stationId: s.id, at: now }); S.mine = S.mine.slice(-500); bumpStreak(); save();
      if (!offline) pings.unshift({ id: body.id, stationId: s.id, stationName: body.stationName, address: body.address, lat: s.lat, lng: s.lng, note: body.note, at: now });
      $("note").value = ""; $("note").classList.add("hidden");
      var c = counts(s.id);
      $("cPlus").textContent = "+3"; $("cTitle").textContent = offline ? t("offline") : t("saved");
      $("cBody").textContent = title(s) + " · " + t("live") + " · " + dropWord(Math.max(c.c24, 1)) + " " + t("inLast");
      $("confirm").classList.remove("hidden"); $("cAgain").focus();
      renderAll();
    };
    if (!navigator.onLine) { S.queue.push(body); save(); return done(true, true); }
    fetch("/api/pings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(function (r) {
      if (r.status === 429) { $("hit").disabled = false; toast(t("rate")); return; }
      if (!r.ok) throw new Error("x");
      done(true, false); setTimeout(refreshPings, 600);
    }).catch(function () { S.queue.push(body); save(); done(true, true); });
  }
  function bumpStreak() { var d = new Date().toISOString().slice(0, 10), y = new Date(Date.now() - 864e5).toISOString().slice(0, 10); if (S.lastDay === d) return; S.streak = S.lastDay === y ? (S.streak || 0) + 1 : 1; S.lastDay = d; }

  /* ---------- render ---------- */
  function renderStation() {
    if (!selected) { $("sName").textContent = "…"; $("sAddr").textContent = ""; $("sMeta").textContent = ""; $("sStatus").textContent = ""; return; }
    var c = counts(selected.id);
    $("sName").textContent = title(selected); $("sAddr").textContent = subLine(selected);
    $("sMeta").textContent = (gpsOn ? t("gpsLock") + " · " : "") + distLabel(selected);
    var st = $("sStatus"); st.className = "status";
    if (c.c24) { st.textContent = t("live") + " · " + dropWord(c.c24) + " " + t("inLast"); st.classList.add("live"); }
    else if (c.fixed && Date.now() - c.fixed < 864e5) { st.textContent = t("fixed"); st.classList.add("fixed"); }
    else st.textContent = t("quiet");
  }
  function renderChips() {
    if (!stations.length) return;
    var seenL = {};
    $("chips").innerHTML = stations.slice(0, 40).map(function (s) {
      var c = counts(s.id), extra = [s.street, distLabel(s)].filter(Boolean).join(" · ");
      var key = title(s) + "|" + extra;                       // two stations that would look the same get a finer distance, then a number
      if (seenL[key] && origin) { extra = [s.street, miles(origin, s).toFixed(2) + " " + t("mi") + " " + compass(origin, s)].filter(Boolean).join(" · "); key = title(s) + "|" + extra; }
      seenL[key] = (seenL[key] || 0) + 1; if (seenL[key] > 1) extra += " · #" + seenL[key];
      return '<button type="button" class="chip' + (selected && selected.id === s.id ? " on" : "") + '" data-id="' + esc(s.id) + '"><b>' + esc(title(s)) + (c.c24 ? ' <span class="cnt">● ' + c.c24 + "</span>" : "") + "</b><span>" + esc(extra) + "</span></button>";
    }).join("");
  }
  function renderFeed() {
    var list = pings.filter(function (p) { return Date.now() - p.at < 7 * 864e5; }).slice(0, 100);
    if (!list.length) { $("feed").innerHTML = '<p class="empty">' + esc(t("noFeed")) + "</p>"; return; }
    $("feed").innerHTML = list.map(function (p) {
      var fx = fixedMap[p.stationId] && fixedMap[p.stationId] >= p.at;
      return '<button type="button" class="item" data-station="' + esc(p.stationId) + '"><p class="t">' + esc(p.stationName) + (fx ? ' <span style="color:var(--ok)">· ' + esc(t("fixed")) + "</span>" : "") + '</p><p class="small mute">' + esc([p.address, ago(p.at)].filter(Boolean).join(" · ")) + "</p>" + (p.note ? '<p class="small">“' + esc(p.note) + "”</p>" : "") + "</button>";
    }).join("");
  }
  function renderMine() { $("myCount").textContent = String(S.mine.length); $("myStreak").textContent = S.streak ? t("streak") + S.streak : ""; }
  function renderMap() {
    if (!map || !window.L) return;
    markers.clearLayers();
    var byId = {}; stations.forEach(function (s) { byId[s.id] = s; });
    pings.forEach(function (p) { if (!byId[p.stationId]) byId[p.stationId] = { id: p.stationId, name: p.stationName, street: p.address, lat: p.lat, lng: p.lng }; });
    Object.keys(byId).forEach(function (id) {
      var s = byId[id], c = counts(id), live = c.c24 > 0, sel = selected && selected.id === id;
      var m = L.circleMarker([s.lat, s.lng], { radius: live ? 8 + Math.min(c.c24, 10) : sel ? 8 : 5, color: sel ? "#f5c400" : live ? "#ff6b3d" : "#8a8a80", weight: sel ? 3 : 1.5, fillColor: live ? "#ff6b3d" : "#2c2f2a", fillOpacity: live ? 0.75 : 0.9 });
      m.bindPopup('<b>' + esc(title(s)) + "</b><br>" + esc(subLine(s)) + "<br>" + esc(live ? t("live") + " · " + dropWord(c.c24) : t("quiet")) + '<br><button type="button" class="btn yellow" style="margin-top:6px;min-height:36px" data-pick="' + esc(id) + '">' + esc(t("ping")) + "</button>");
      m.addTo(markers);
    });
  }
  function renderAll() { renderStation(); renderChips(); renderFeed(); renderMine(); renderMap(); $("where").textContent = t("where"); }

  function pick(id) { var s = stations.find(function (x) { return x.id === id; }); if (!s) { var p = pings.find(function (x) { return x.stationId === id; }); if (p) s = { id: id, name: p.stationName, street: p.address, lat: p.lat, lng: p.lng }; } if (s) { selected = s; renderAll(); } }
  function showTab(name) {
    document.querySelectorAll(".tab").forEach(function (el) { el.classList.toggle("hidden", el.id !== "tab-" + name); });
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tab") === name); });
    if (name === "map") { $("mapSlot").appendChild($("map")); setTimeout(function () { map && map.invalidateSize(); }, 50); }
    else if (window.innerWidth >= 1024) { $("mapWide").appendChild($("map")); setTimeout(function () { map && map.invalidateSize(); }, 50); }
    $("scroll").scrollTop = 0;
  }
  function initMap() {
    if (!window.L) return;
    if (window.innerWidth < 1024) $("mapSlot").appendChild($("map"));
    map = L.map("map", { zoomControl: true }).setView([35.0456, -85.3097], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
    markers = L.layerGroup().addTo(map);
    var tm; map.on("moveend", function () { clearTimeout(tm); tm = setTimeout(function () { var c = map.getCenter(); if (mapCenterLoaded && miles(mapCenterLoaded, { lat: c.lat, lng: c.lng }) > 4) { mapCenterLoaded = { lat: c.lat, lng: c.lng }; fetch("/api/stations?lat=" + c.lat.toFixed(4) + "&lng=" + c.lng.toFixed(4)).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (!j) return; var have = {}; stations.forEach(function (s) { have[s.id] = 1; }); j.stations.forEach(function (s) { if (!have[s.id]) stations.push(s); }); renderMap(); }); } }, 800); });
    map.on("popupopen", function (e) { var b = e.popup.getElement().querySelector("[data-pick]"); if (b) b.onclick = function () { pick(b.getAttribute("data-pick")); map.closePopup(); showTab("ping"); }; });
    window.addEventListener("resize", function () { var cur = document.querySelector("#tabs button.on").getAttribute("data-tab"); if (window.innerWidth >= 1024 && $("map").parentNode !== $("mapWide")) { $("mapWide").appendChild($("map")); map.invalidateSize(); if (cur === "map") showTab("ping"); } });
  }

  /* ---------- desk ---------- */
  function openDesk() {
    if (!selected) { toast(t("needStation")); return; }
    var c = counts(selected.id);
    $("dStation").textContent = title(selected) + (subLine(selected) ? " · " + subLine(selected) : "");
    $("dHistory").textContent = t("hist7") + dropWord(c.c7) + t("hist30") + dropWord(c.c30) + (c.last ? t("lastPing") + ago(c.last) : "");
    $("dMsg").textContent = ""; $("desk").classList.remove("hidden");
  }

  /* ---------- events ---------- */
  $("hit").addEventListener("click", doPing);
  $("cAgain").addEventListener("click", function () { $("confirm").classList.add("hidden"); });
  $("confirm").addEventListener("click", function (e) { if (e.target === $("confirm")) $("confirm").classList.add("hidden"); });
  $("noteBtn").addEventListener("click", function () { $("note").classList.toggle("hidden"); if (!$("note").classList.contains("hidden")) $("note").focus(); });
  $("locBtn").addEventListener("click", function () { useLocation(false); });
  $("chips").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) pick(b.getAttribute("data-id")); });
  $("feed").addEventListener("click", function (e) { var b = e.target.closest("[data-station]"); if (b) { pick(b.getAttribute("data-station")); showTab("ping"); } });
  $("tabs").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) showTab(b.getAttribute("data-tab")); });
  $("langBtn").addEventListener("click", function () { lang = lang === "en" ? "es" : "en"; S.lang = lang; save(); applyLang(); });
  $("deskBtn").addEventListener("click", openDesk);
  $("deskClose").addEventListener("click", function () { $("desk").classList.add("hidden"); });
  $("searchForm").addEventListener("submit", function (e) {
    e.preventDefault(); var q = $("q").value.trim(); if (q.length < 2) return;
    var local = stations.filter(function (s) { return (title(s) + " " + subLine(s)).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    var html = local.slice(0, 5).map(function (s) { return '<button type="button" class="item" data-sid="' + esc(s.id) + '"><p class="t">' + esc(title(s)) + '</p><p class="small mute">' + esc([subLine(s), distLabel(s)].filter(Boolean).join(" · ")) + "</p></button>"; }).join("");
    $("searchResults").innerHTML = html + '<p class="small mute">' + esc(t("loading")) + "</p>";
    fetch("/api/geocode?q=" + encodeURIComponent(q)).then(function (r) { return r.ok ? r.json() : { results: [] }; }).then(function (j) {
      var g = (j.results || []).map(function (x) { return '<button type="button" class="item" data-lat="' + x.lat + '" data-lng="' + x.lng + '"><p class="t">📍 ' + esc(x.label.split(",").slice(0, 2).join(",")) + '</p><p class="small mute">' + esc(x.label) + "</p></button>"; }).join("");
      $("searchResults").innerHTML = html + g || '<p class="small mute">' + esc(t("none")) + "</p>";
    }).catch(function () { $("searchResults").innerHTML = html || '<p class="small mute">' + esc(t("busy")) + "</p>"; });
  });
  $("searchResults").addEventListener("click", function (e) {
    var b = e.target.closest(".item"); if (!b) return;
    if (b.dataset.sid) { pick(b.dataset.sid); } else { gpsOn = false; origin = { lat: +b.dataset.lat, lng: +b.dataset.lng }; $("gpsMsg").textContent = ""; loadStations(origin.lat, origin.lng, "search"); }
    $("searchResults").innerHTML = ""; $("q").value = "";
  });
  $("pizzaForm").addEventListener("submit", function (e) {
    e.preventDefault(); $("pizzaMsg").textContent = "…";
    fetch("/api/pizza", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: $("pName").value, contact: $("pContact").value, deviceId: S.deviceId }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) { $("pizzaMsg").textContent = x.ok ? (x.j.already ? t("pizzaAgain") : t("pizzaOk")) : (x.j.error || "Error"); if (x.ok) { $("pContact").value = ""; } })
      .catch(function () { $("pizzaMsg").textContent = t("busy"); });
  });
  $("dFix").addEventListener("click", function () {
    if (!selected) return;
    fetch("/api/fixed", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stationId: selected.id, code: $("dCode").value.trim() }) })
      .then(function (r) { if (!r.ok) { $("dMsg").textContent = t("wrong"); return; } $("dMsg").textContent = t("fixedOk"); refreshPings(); }).catch(function () { $("dMsg").textContent = t("busy"); });
  });
  $("dSend").addEventListener("click", function () {
    if (!selected) return;
    fetch("/api/dispute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stationId: selected.id, stationName: title(selected), message: $("dText").value, contact: $("dContact").value }) })
      .then(function (r) { return r.json().then(function (j) { $("dMsg").textContent = r.ok ? t("disputeOk") : j.error; if (r.ok) $("dText").value = ""; }); }).catch(function () { $("dMsg").textContent = t("busy"); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { $("confirm").classList.add("hidden"); $("desk").classList.add("hidden"); } });
  window.addEventListener("online", flush);

  initMap(); applyLang();
  // Try GPS right away if already allowed; otherwise show approximate area and wait for the "Use my location" tap.
  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: "geolocation" }).then(function (p) { if (p.state === "granted") useLocation(true); else { loadStations(); if (p.state === "denied") $("gpsMsg").textContent = t("gpsDenied"); } }).catch(function () { useLocation(true); });
  } else useLocation(true);
  refreshPings(); flush(); setInterval(function () { if (!document.hidden) { refreshPings(); flush(); } }, 30000);
})();
/* keep the tab bar clear of the host badge if one is injected */
(function () { var n = 0, iv = setInterval(function () { if (document.getElementById("nl-badge-frame")) { document.body.classList.add("nlb"); clearInterval(iv); } else if (++n > 40) clearInterval(iv); }, 250); })();
