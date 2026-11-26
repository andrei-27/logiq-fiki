# LogiQ · Fiki

[Project journal](https://andrei-27.github.io/logiq-fiki/) · [M4 prototype](https://andrei-27.github.io/logiq-fiki/news.html) · [Wireframes & interview guide](https://andrei-27.github.io/logiq-fiki/ux.html)

M4 simulates automatic news review: read → LogiQ alert → findings and sources → continue. Browser articles and social feeds each have desktop and mobile scenarios. Three fictional stories use curated evidence; there is no live analysis.

Run `python3 serve.py` and open http://localhost:8000/. No build or dependencies required. GitHub Pages serves the repository root from `main`.

Main files: `news.html`, `news.js`, `news-data.js`, `m4.css` (prototype); `ux.html`, `ux.js`, `assets/m4/` (research and wireframes); `index.html` (journal); `site-ui.css`, `site.js` (shared responsive UI).


## M5 — validation 2 (lead generation)

**Get early access** is the main action on the [landing page](https://andrei-27.github.io/logiq-fiki/landing.html#early-access). Readers can also try the demo without signing up, then use its early-access button to return to the Formspree signup with their campaign tags intact. The [M5 campaign report](./m5-campaign.html) shows the waitlist total through 25 November, campaign-day channel results, geographic reach and outreach screenshots.

The public Formspree endpoint and PostHog EU project token are configured in `m5-config.js` (no private API secrets). Only the published site sends submissions or analytics; local and fork previews cannot create campaign traffic. The signup requires consent. PostHog captures page views, CTA clicks and form engagement; input values and signup form text are masked for replay. Visitors can disable tracking in the footer of each tracked page and can still sign up. Keep private keys, subscriber exports and unredacted screenshots out of this repository.

**24–25 November snapshot:** The waitlist total is **31** case-insensitively distinct email addresses in accepted Formspree rows with consent: 2 baseline entries on the 24th and 29 on the 25th. This includes team entries; it is not a count of verified external customers. Separately, a PostHog Trends query counting unique people with `lead_signup_success` over the whole period returned **11**, with no prerequisite event or time-since-landing filter. Its scope is Europe/Bucharest, the production landing host/path, the M5 campaign, regular traffic and the project’s test-account exclusion.

The channel comparison uses a team-provided allocation of the overall totals: 60 landing visitors and 45 form viewers on 25 November (PostHog), and 31 waitlist addresses through that date (Formspree). The channel rows are estimates, not the export’s recorded attribution. The original Formspree source counts are personal 10, university 3, online 2 and direct 16. No row-level subscriber data is needed to maintain the report.

Use [the three outreach links](./m5-campaign.html#share) to invite readers to the landing page with `utm_campaign=m5_validation_2` and one of `personal/message`, `university/community` or `online/social` (source/medium). A newly tagged entry replaces the old tags together; demo links carry them back to signup even without session storage. Break down each event by its recorded `campaign_source`. Keep direct and QA traffic separate; use `internal_test` for intentional tests on the live domain. Log actual post times and redacted proof, compare counts in the same reporting window, and document the next channel to test.

The public website is served from `main`. A branch or PR is not a deployment. No outreach impressions, leads or channel winners should be claimed without real campaign evidence.

Run `node --test tests/m5-attribution.test.cjs` for the dependency-free campaign attribution tests. Contributor tooling is optional: `npx skills@1.9.0 install --frozen-lockfile --agent github-copilot` restores the five project-local skills from `skills-lock.json`; their copies are not shipped to the public site.
