# LogiQ · Fiki

A one-page project journal for the LogiQ student startup, SE 2026–27. LogiQ explores contextual, accessible explanations of potentially flawed arguments and persuasive techniques.

## Deploy with GitHub Pages

1. Open this repository’s **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select **main** and **/ (root)**, then **Save**.
4. Wait for GitHub’s deployment to finish. The expected URL is:
   **https://andrei-27.github.io/logiq-fiki/**

No build command, package install, API key, or custom domain is required. All asset URLs are relative, including on the `/logiq-fiki/` project path. Deployment has intentionally been left to the repository owner.

## Before submitting M1

- Replace the two initials portraits with team photos (M1 asks for photos).
- Add both team members’ email addresses in the team section.
- Confirm or edit the proposed role split.
- Choose the contact person and email to enter in the submission form.
- Review the customer focus and business assumptions; these are proposals, not validated findings.
- Open the deployed URL in a private browser window and check the mobile layout.

Do not replace missing team details with fabricated information. Initials are explicitly labeled placeholders, not photos.

## M1 content map

| Requirement | Page location |
| --- | --- |
| Project title | Header and introduction |
| Team and roles, photos, emails | Team (photos and emails pending) |
| Problem | The problem & the idea |
| Solution / value proposition | Our value proposition and interactive example |
| Customer segments | Who we’re building for |
| Competition | Comparison of alternative approaches |
| Competitive advantage | Proposed angle and advantage hypothesis |
| Key metrics | Defining success |
| Cost structure | Startup model: costs |
| Revenue streams | Startup model: revenue hypotheses |

Official requirements: https://ocw.cs.pub.ro/courses/se/project/milestones/m1

## Edit the website

- `index.html` — all page copy, team information, and milestone journal.
- `styles.css` — colors, typography, responsive layout, and print styles.
- `script.js` — three handcrafted argument examples.
- `assets/favicon.svg` — small vector brand mark.

To add a milestone result, edit its `<details class="milestone">` section, change its visible status, and add evidence links and findings. Update the current-focus labels in the project strip and journal together. The milestone sequence follows the supplied course outline (including M11; no M10 is invented).

## Local preview

Open `index.html` directly, or run `python3 -m http.server 8000` from this folder and visit http://localhost:8000. There are no third-party fonts, scripts, analytics, or other runtime dependencies.

## Editorial decisions

- English presentation with the team’s names preserved.
- Existing LogiQ PDFs and presentation notes informed the product concept, contextual explanations, progressive disclosure, and risk framing. Their milestone numbers refer to earlier design work; they are not reported as completed SE course milestones.
- Students and educators are a **proposed initial focus**; a broader audience remains a longer-term hypothesis.
- The interactive examples are explicitly labeled illustrations. They do not call an AI model or analyze live text.
- No unsupported population statistics, fictional customers, invented validation results, or measured traction are displayed.
- Competitor descriptions are category-level positioning hypotheses, not a verified audit of current named products.
- Proposed quality metrics distinguish reviewed false positives from reader disagreement.
- No team emails or actual portraits were supplied; the site makes their absence explicit.

The site stores no user data and sends no analysis requests. No deployment workflow is included, so publishing remains an owner action.
