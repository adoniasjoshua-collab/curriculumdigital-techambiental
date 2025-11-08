# Adonias PROD10X Resume Website

A simple, fast, and printable resume website for Adonias. Content is driven by JSON files and rendered on the client. Includes optimized print styles for clean PDF export.

## Features
- Semantic, accessible HTML layout
- JSON‑driven content (experience, education, qualifications, languages)
- Separate print stylesheet for PDF export
- No build step required — open and go

## Project Structure
- `index.html` — Main page
- `assets/css/styles.css` — Base and layout styles
- `assets/css/print.css` — Print‑optimized styles
- `assets/js/app.js` — Fetches JSON and renders sections
- `assets/data/` — JSON data files

## Getting Started
1. Open `index.html` in your browser. For best results (due to browser security around local files), serve via a local server:
   - VS Code: use the Live Server extension, or
   - Node: `npx serve .` then open the shown URL
2. Edit the JSON files in `assets/data/` to update content.
3. Use your browser’s print dialog to export to PDF (A4 recommended).

## Data Files
- `assets/data/experiencia.json`
- `assets/data/qualificacoes.json`
- `assets/data/formacao.json`
- `assets/data/idiomas.json`

All files are UTF‑8 (no BOM).

