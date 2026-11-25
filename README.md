# LogiQ · Fiki

[Project journal](https://andrei-27.github.io/logiq-fiki/) · [M4 prototype](https://andrei-27.github.io/logiq-fiki/news.html) · [Wireframes & interview guide](https://andrei-27.github.io/logiq-fiki/ux.html)

M4 simulates automatic news review: read → LogiQ alert → findings and sources → continue. Browser articles and social feeds each have desktop and mobile scenarios. Three fictional stories use curated evidence; there is no live analysis.

Run `python3 serve.py` and open http://localhost:8000/. No build or dependencies required. GitHub Pages serves the repository root from `main`.

Main files: `news.html`, `news.js`, `news-data.js`, `m4.css` (prototype); `ux.html`, `ux.js`, `assets/m4/` (research and wireframes); `index.html` (journal); `site-ui.css`, `site.js` (shared responsive UI).


## M5 — validation 2 (lead generation)

**Get early access** is the main action on the [landing page](https://andrei-27.github.io/logiq-fiki/landing.html#early-access). Readers can also try the demo without signing up, then use its early-access button to return to the Formspree signup with their campaign tags intact. The [M5 campaign report](./m5-campaign.html) documents the 25 November experiment, outreach screenshots, geographic reach, channel results and counting method.

The public Formspree endpoint and PostHog EU project token are configured in `m5-config.js` (no private API secrets). Only the published site sends submissions or analytics; local and fork previews cannot create campaign traffic. The signup requires consent. PostHog captures page views, CTA clicks and form engagement; input values and signup form text are masked for replay. Visitors can disable tracking in the footer of each tracked page and can still sign up. Keep private keys, subscriber exports and unredacted screenshots out of this repository.

**25 November snapshot:** The ordered one-hour PostHog funnel was `landing_page_viewed` (60) → `lead_form_viewed` (45) → `lead_signup_success` (11). The query uses Europe/Bucharest, the production landing host/path, the M5 campaign, regular traffic and the project test-account exclusion. Formspree separately returned 29 distinct consenting addresses dated the 25th; its two 24 November baseline rows are not campaign-day signups. Direct entries have no measured outreach source. The export cannot establish a count of independent, non-test customers. No row-level subscriber data is needed to maintain the report.

Use [the three outreach links](./m5-campaign.html#share) and [the dated baseline](./m5-campaign.html#baseline). Invite readers to the landing page with `utm_campaign=m5_validation_2` and one of `personal/message`, `university/community` or `online/social` (source/medium). A newly tagged entry replaces the old tags together; demo links carry them back to signup even without session storage. Break down the funnel by `campaign_source` at the landing step. Keep direct and QA traffic separate; use `internal_test` for intentional tests on the live domain. Log actual post times and redacted proof, compare counts in the same reporting window, and document the next channel to test.

The public website is served from `main`. A branch or PR is not a deployment. No outreach impressions, leads or channel winners should be claimed without real campaign evidence.

Run `node --test tests/m5-attribution.test.cjs` for the dependency-free campaign attribution tests. Contributor tooling is optional: `npx skills@1.9.0 install --frozen-lockfile --agent github-copilot` restores the five project-local skills from `skills-lock.json`; their copies are not shipped to the public site.
