# AGENTS.md — GeoFields

## Project Overview
Static HTML/CSS/JS web GIS application for mapping missing persons cases on U.S. public lands.
Uses Leaflet JS (CDN) for maps and `localStorage` for data persistence. No backend, no build step.

## Stack
- **Frontend:** Vanilla HTML5/CSS3/JavaScript (ES6+), single `index.html` + `src/app.js`
- **Mapping:** Leaflet 1.9.4 + Leaflet Geosearch (loaded from unpkg CDN)
- **Data:** Browser `localStorage` only — no database or API server
- **Fonts:** Google Fonts (Cinzel, Roboto Condensed)

## Running in Base44
- `docker-compose.base44.yml` serves the static files via `python:3.12-slim` (`http.server`) on port 3000.
- The repo directory has `0700` permissions, so nginx (non-root worker) gets 403 — Python's `http.server` runs as root and works.
- No external secrets or credentials required.
- Edits to `index.html` or `src/app.js` are reflected on next page load (no build/reload step needed).

## Verification
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` should return `200`.
- Preview should show the three-pane layout: Data Entry Console (left), Leaflet map (center), Incident Directory (right) with sample data.
