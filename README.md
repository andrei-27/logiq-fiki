# LogiQ · Fiki

One-page project journal for LogiQ, a critical-thinking copilot concept.

**Website:** https://andrei-27.github.io/logiq-fiki/

## Edit

- `index.html` — content, team, and milestones.
- `styles.css` — appearance and responsive layout.
- `script.js` — illustrative argument examples.
- `transcripts/` — interview transcripts linked from M2; `transcript.js` makes their timestamps play the recording.
- `serve.py` — local preview server.
- `interviews.html`, `findings.html`, `interviews.js` — interviews and live Google Form responses.
- `assets/survey/responses-csv-link.txt` — the published CSV of form responses; `interviews.js` reads the feed address from this file.
- `assets/survey/form-link.txt` — the Google Form link. If it changes, also update the "Open the online survey" links in `index.html` and `interviews.html`.

## Preview

Run `python3 serve.py` and open http://localhost:8000/. No installation or build is required.

Use `serve.py` rather than opening `index.html` directly or running `python3 -m http.server`: the built-in server does not support the byte-range requests that Safari needs to play the interview recordings. Check audio in a regular browser (Chrome, Firefox or Safari).

## Publish

In GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
