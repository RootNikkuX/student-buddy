# Student Buddy ingest backend

TinyFish Agent scrapes the pages in `src/sources.js` on a schedule, returns structured JSON, and this Worker saves it in a D1 database. The website reads it from `GET /api/opportunities`.

```
cron (every 10 min) -> start TinyFish agent runs (max 2 at once) -> poll -> validate -> D1 -> website
```

## Setup (about 10 minutes, on your own computer)
```bash
cd ingest
npm i -g wrangler            # or use npx wrangler
wrangler login
wrangler d1 create student-buddy          # copy the database_id into wrangler.toml
wrangler d1 execute student-buddy --remote --file=schema.sql
wrangler secret put TINYFISH_API_KEY      # paste a NEW TinyFish key when asked
wrangler secret put INGEST_TOKEN          # any long random string; you need it for POST and /api/run
wrangler deploy
```
Then test:
```bash
curl -X POST https://student-buddy-ingest.YOURNAME.workers.dev/api/run -H "Authorization: Bearer YOUR_INGEST_TOKEN"
curl https://student-buddy-ingest.YOURNAME.workers.dev/api/status -H "Authorization: Bearer YOUR_INGEST_TOKEN"
curl "https://student-buddy-ingest.YOURNAME.workers.dev/api/opportunities?type=hackathon"
```
The first `/api/run` starts 2 agent runs. Agent runs take a few minutes, so call `/api/run` again (or wait for the cron) to save the results.

Show them on the website: put the Worker link in `OPP_API` inside `js/opportunities.js`.

## API
| Route | Auth | What |
|---|---|---|
| `GET /api/opportunities?type=&q=&open=0&limit=&offset=` | public | list (open only unless `open=0`) |
| `POST /api/opportunities` | Bearer token | save `[...]` or `{opportunities:[...]}` (max 100) |
| `POST /api/run` | Bearer token | run one scheduler tick now |
| `GET /api/status` | Bearer token | sources, recent runs, totals |

Item fields: `title, type, org, deadline (YYYY-MM-DD), deadline_text, eligibility, pay, location, source_url, description`.

## Notes
- Re-scrapes update the same row (id = hash of title + site), so there are no duplicates. Past deadlines and items not seen for 30 days become `closed`. Set `hidden=1` on a bad row to hide it.
- Each agent run uses TinyFish credits: 5 sources x 2 times a day = about 10 runs a day. Change `REFRESH_HOURS` in `src/sources.js`.
- Scraped data can be wrong or stale. The app should always show the official link. Check each site's terms before scraping.
- Local test (no internet, fake TinyFish): `node --no-warnings test/run.mjs`
- Never commit keys. Keys live only in `wrangler secret`.
