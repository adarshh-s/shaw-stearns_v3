# Shaw Stearns — website

React + Vite. Four pages: Home, About, Services, Contact (careers is a tab on Contact).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

- **Copy** — all text lives in `src/content.js`.
- **Liquid hero** — `src/lib/liquid.js` (WebGL). Colours: `PALETTE` in that file.
- **Logo** — `src/components/Logo.jsx`, traced from the official SVG.
- **Styles** — `src/styles.css`; colours are tokens at the top (`--accent: #9a8254`).
- **Forms** — no backend yet; submitting opens a pre-filled email to enquiries@shawstearns.com.
  Swap `onSubmit` in `src/pages/Contact.jsx` for Formspree / an API to receive submissions and file uploads.
- **Hosting** — it's a single-page app: configure the host to serve `index.html` for all routes
  (Netlify `_redirects`, Vercel rewrites, etc.).
