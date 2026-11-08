---
title: LogiQ Fiki
description: Project journal, concept landing page and interactive wireframes for LogiQ.
---

## LogiQ project journal

Static project journal for LogiQ, a critical-thinking copilot concept.

[Public Fiki](https://andrei-27.github.io/logiq-fiki/)

## Edit

- [index.html](./index.html): content, team, milestones and M3 deliverables.
- [landing.html](./landing.html): separate customer-facing concept landing page.
- [wireframes.html](./wireframes.html): five-screen interactive prototype, with populated no-JavaScript fallback.
- [wireframes.js](./wireframes.js): screen navigation, sample selection, clipboard copy and local-only feedback.
- [assets/m3-wireframes.svg](./assets/m3-wireframes.svg): static screen-and-flow overview embedded in M3.
- [styles.css](./styles.css): shared appearance and responsive layout.
- [m3.css](./m3.css): landing page, prototype and M3 presentation, including print styles.
- [examples.js](./examples.js): shared handcrafted arguments, loaded before both [script.js](./script.js) and [wireframes.js](./wireframes.js).
- [script.js](./script.js): Fiki example-switching controls.
- [transcripts/](./transcripts/): interview transcripts linked from M2; [transcript.js](./transcript.js) makes their timestamps play the recording.
- [serve.py](./serve.py): local preview server.
- [interviews.html](./interviews.html), [findings.html](./findings.html), [interviews.js](./interviews.js): interviews and live Google Form responses.
- [assets/survey/responses-csv-link.txt](./assets/survey/responses-csv-link.txt): the published CSV of form responses read by [interviews.js](./interviews.js).
- [assets/survey/form-link.txt](./assets/survey/form-link.txt): the Google Form link. If it changes, also update the survey links in [index.html](./index.html) and [interviews.html](./interviews.html).

## Preview

Run `python3 serve.py` from this folder and open <http://localhost:8000/>.
No installation or build is required.

Use [serve.py](./serve.py) rather than opening HTML files directly or running
`python3 -m http.server`: the built-in server does not support the byte-range
requests that Safari needs to play the interview recordings. Check audio in a
regular browser (Chrome, Firefox or Safari).

## M3 wireframes and landing page

- Open <http://localhost:8000/index.html#m3> for the milestone documentation and embedded wireframes.
- Open <http://localhost:8000/landing.html> for the customer-facing page.
- Open <http://localhost:8000/wireframes.html> for the prototype.

The main flow is Reading → Explanation. Context, Share and Feedback are optional
branches; every branch can return to reading. All screen links use URL fragments,
so direct links and browser Back/Forward work. Changing the sample resets local
feedback and copy status. Reset restores the first sample. Reloading starts over;
no prototype state is persisted.

Use "Show all screens" to inspect the full structure, or the browser's print
command to export all five populated screens. With JavaScript disabled, the
complete popularity example remains readable, but interactive controls are
unavailable.

The prototype has no live AI, real text selection, source retrieval, analytics,
accounts or feedback submission. Clipboard access is requested only after clicking
"Copy explanation"; if access fails, the page explains how to copy manually.
Feedback confirmation is explicitly a local simulation, not evidence collected
for design validation.

When editing examples, keep the static first-example fallback in
[index.html](./index.html) and [wireframes.html](./wireframes.html) consistent with
[examples.js](./examples.js).

### Browser checks

1. Follow both M3 links from the Fiki, then the landing page's prototype action.
2. Try all three samples. Check that the selected passage, explanation, context and share text agree.
3. Open each optional branch; test dismissal, Back/Forward and direct links such as `wireframes.html#context`.
4. Test clipboard success and denied access. Verify that copied text includes the simulation notice and caveats.
5. Try each feedback choice and the required-choice validation. Change a choice, sample or reset the demo; check for stale confirmations.
6. Check a narrow mobile viewport, keyboard navigation, all-screens mode, print preview and JavaScript disabled.
7. Recheck the original Fiki example buttons and M2 links.

## Publish

The existing GitHub Pages setup serves the repository root from `main`.
Merge the reviewed changes into that branch to publish them; do not treat local
preview links as evidence that the public site has been updated.

If configuring Pages for the first time, choose Settings → Pages → Deploy from a
branch → main → / (root) → Save.

After deployment, the M3 links resolve to:

- <https://andrei-27.github.io/logiq-fiki/index.html#m3>
- <https://andrei-27.github.io/logiq-fiki/landing.html>
- <https://andrei-27.github.io/logiq-fiki/wireframes.html>
