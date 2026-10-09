# Student Buddy
KCC Build with Bharat 4.0 | Team Null Pointers

Static app (no build step, no framework). Open `index.html` in a browser, or host the folder on GitHub Pages.

## Structure
```
index.html          page markup + script order
css/style.css       all styles (dark/light theme, mobile + desktop layout)
js/config.js        storage helpers (sGet/sSet), state, constants
js/data.js          events, internships, perks, courses, certs, abroad countries
js/sheet.js         Google Sheet loader (optional live data)
js/data-extra.js    govt jobs, sports, language exams, budget data, research, YouTube, helplines
js/app.js           core: eligibility check, onboarding, home/discover/abroad/me views, render()
js/features.js      research tab, support tab, budget calculator, Ask Buddy chatbot
js/main.js          startup
```
Script order in index.html matters (config, data, data-extra, app, features, main).

## Edit data
Add or change listings in `js/data.js` and `js/data-extra.js`. Check official notices before trusting any date, fee or age limit.

## Chatbot
Rule-based over the app data. To plug a real AI, set `AI_ENDPOINT` in `js/features.js` (a small server or Cloudflare Worker that calls an LLM).

## Deploy (GitHub Pages)
Push this folder to a repo, then Settings > Pages > main branch, root.

## Live data from Google Sheet (optional)
1. Google Sheets > File > Import > upload `listings-template.csv` (one row per listing).
2. File > Share > Publish to web > choose the sheet tab > format **CSV** > Publish. Copy the link.
3. Paste the link in `js/sheet.js`: `const SHEET_URL='https://docs.google.com/.../pub?output=csv';`
4. Edit rows in the sheet. The app picks changes on next open (published sheets can take a few minutes to refresh).

Rules: same `id` as a built-in listing = it overrides that listing. New `id` = new listing. `hide` = yes removes a listing.
`deadline` as YYYY-MM-DD shows the Closing soon tag (last 21 days). `how` steps are separated with ` | `. `years` like `1;2;3`.
`type` = hackathon, sports, etc. or `job` for govt jobs (use `job_type`: army, navy, airforce, police...).
If the sheet cannot load, the app uses the last saved copy, then the built-in data.
Only publish data you are happy to make public.
