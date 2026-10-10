# Student Buddy React client
React (Vite) client for the same backend: Cloudflare Workers + D1 + TinyFish. No key in the browser.
- `src/api.js` Worker calls, `src/hooks.js` `useOpportunities`, `useScamCheck`, `src/App.jsx` demo UI.
- Run: `npm install && npm run dev`. Override with `VITE_TF_API`, `VITE_OPP_API`.
- The live GitHub Pages site stays vanilla JS; this is the React integration path.
