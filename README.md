# LogiQ · Fiki

One-page project journal for LogiQ, a critical-thinking copilot concept.

**Website:** https://andrei-27.github.io/logiq-fiki/

## Edit

- `index.html` — content, team, and milestones.
- `styles.css` — appearance and responsive layout.
- `script.js` — illustrative argument examples.
- `transcripts/` — interview transcripts linked from M2; `transcript.js` makes their timestamps play the recording.
- `serve.py` — local preview server.

## Preview

Run `python3 serve.py` and open http://localhost:8000/. No installation or build is required.

Use `serve.py` rather than opening `index.html` directly or running `python3 -m http.server`: the built-in server does not support the byte-range requests that Safari needs to play the interview recordings. Check audio in a regular browser (Chrome, Firefox or Safari).

## Publish

In GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
