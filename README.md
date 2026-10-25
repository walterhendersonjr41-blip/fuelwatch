# FuelWatch

Report gas pumps with a broken or leaking nozzle in one tap ("ping"), so other drivers know and stations fix them. Map of nearby stations (OpenStreetMap), live feed of reports, a station "desk" where staff can mark a pump fixed with a 4-digit code or send a dispute, a Spanish toggle, an offline queue and a desktop layout. Pizza of the Week: a free thank-you drawing with no purchase or ping needed.

## Demo (GitHub Pages)
This copy runs as a static demo. `demo-shim.js` answers the app's `/api/*` calls in your browser: sample stations for the default area (or live OpenStreetMap stations near you), pings saved only in your browser, and search through OpenStreetMap. The Pizza entry, disputes and desk codes are switched off, so nothing is collected.

## Real app
- `index.html`, `app.js`, `style.css`, `pizza.html`, `terms.html`, `privacy.html`, `manifest.webmanifest`, `favicon.svg`, `og.jpg` – front end
- `netlify/functions/fw.mjs` – the backend (one Netlify Function + Netlify Blobs): shared pings with anti-spam limits, station lookup cache, geocode, pizza entries, disputes, desk codes, owner admin
- `netlify.toml`, `package.json` – Netlify config
- `tests/qa.cjs`, `tests/stations-fixture.json` – browser QA script

To run the real backend, deploy to Netlify and set the env var `FW_ADMIN_TOKEN` (your own secret). No token or data is included here. On `*.netlify.app` the demo shim switches itself off.

Created by Walter Henderson Jr.
