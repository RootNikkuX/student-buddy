# TinyFish setup (about 15 minutes)

## Step 1. TinyFish key
1. Every team member makes an account with the KCC sign-up link (new Gmail each).
2. Open https://agent.tinyfish.ai/api-keys and click create. Copy the key.

## Step 2. Cloudflare Worker (keeps the key secret)
1. Make a free account at https://dash.cloudflare.com
2. Workers & Pages > Create > Create Worker > name it `student-buddy-tf` > Deploy.
3. Click "Edit code", delete everything, paste all of `worker/worker.js`, click Deploy.
4. Settings > Variables and Secrets > Add > type **Secret** > name `TINYFISH_API_KEY` > paste your key > Deploy.
5. Copy your Worker link. It looks like `https://student-buddy-tf.yourname.workers.dev`
6. Open that link in a browser. You should see: `{"ok":true,"service":"student-buddy-tinyfish-proxy"}`

## Step 3. Connect the website
Open `js/tinyfish.js`, first lines:
    const TF_API='';
Put your Worker link inside the quotes:
    const TF_API='https://student-buddy-tf.yourname.workers.dev';
Save. Push to GitHub Pages (or just open index.html).

## Step 4. Test
- Discover > any listing > How to apply > press "Check live with TinyFish".
- Ask Buddy: "gate 2027 exam date" (not in the app, so it does a live web search).

## Notes
- Search and Fetch are free (about 5 searches/min). The Agent check uses TinyFish credits. If the agent fails, the Worker falls back to the free Fetch API.
- Optional: add a Worker variable `ALLOWED_ORIGIN` = `https://yourname.github.io` so only your site can use the Worker.
- Never put the API key in any file inside the website folder.

## v2 features (needs the NEW worker/worker.js pasted into Cloudflare, then Deploy)
| Feature | TinyFish API | Where in the app |
|---|---|---|
| Alert me | Monitor API (daily 9 AM IST page monitor) | Any listing > How to apply > "Alert me" |
| Is this real? | Fetch + Search (page text + scam reports + domain rules) | Home > "Is this real?", or paste a link in Ask Buddy |
| Professor page to email | Fetch | Research > "Professor's page link" > Read with TinyFish |
| Cited answers | Research API (instant mode) with Search as backup | Study abroad > "Ask with sources" |
Notes: Research API is in beta (5 runs/day, may need enabling on the account); the app falls back to Search sources if it fails. Monitor email alerts are switched on in the TinyFish dashboard.
