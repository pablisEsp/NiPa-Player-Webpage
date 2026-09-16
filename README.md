# NiPa Player — website

Static marketing site for [www.nipaplayer.com](https://www.nipaplayer.com), served by **GitHub Pages**.
There is no build step: the repository root *is* the site, and every push to `main` deploys it
through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Layout

```
/                       Public pages. Each file here is a public URL (see "Frozen URLs").
├── index.html          Landing page (EN)
├── faq.html            FAQ (EN)
├── privacy-policy.html Legal — linked from the app and both store listings
├── terms.html          Legal — linked from the app and both store listings
├── delete-account.html Account-deletion instructions (Play Console requirement)
├── signed-in.html      Landing after desktop Google Sign-In succeeds (opened by the Windows app)
├── sign-in-cancelled.html  Landing after desktop Google Sign-In is cancelled
├── 404.html            Branded 404 (GitHub Pages looks for it at the root)
├── demo.m3u            Demo playlist for app-store review and screenshots (points into /demo)
├── es/                 Spanish versions of the pages above (same file names)
├── get/                "Download the app" interstitial for shared links (noindex)
├── tv/                 TV pairing landing: /tv?code=XXXXXXXX (universal / app link)
├── demo/               Media referenced by demo.m3u (posters + short CC-BY Blender clips, ~44 MB)
├── assets/
│   ├── css/styles.css  The single stylesheet, shared by every page
│   ├── js/site.js      Shared behaviour: navbar, mobile menu, scroll animations, smooth anchors
│   ├── js/faq.js       FAQ accordion + search (loaded only by the FAQ pages)
│   ├── badges/         Store badges (EN/ES)
│   └── *.png/*.avif    Screenshots, icons, wordmark
├── .well-known/        apple-app-site-association + assetlinks.json (deep links into the app)
├── CNAME               Custom domain — must stay at the root
├── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
```

Pages under `tv/` and `get/` keep their small page-specific script inline on purpose: it is
security-sensitive (sanitises a query parameter) and has no reason to be shared.

## Frozen URLs — do not rename or move

These paths are referenced from outside this repo. Changing one silently breaks the app or a
store listing; nothing in this repo will fail loudly.

| Path | Referenced by |
|---|---|
| `/privacy-policy.html`, `/terms.html`, `/faq.html` | `AppConstants` in the app; App Store Connect + Play Console listings |
| `/delete-account.html` | Play Console "data deletion" URL |
| `/signed-in.html`, `/sign-in-cancelled.html` (+ `/es/…`) | `GoogleDesktopAuth` in the app (Windows sign-in redirect). Never append a code or token to these URLs. |
| `/tv`, `/tv/` | TV pairing QR deep link (`tv_pairing_service.dart`), `apple-app-site-association`, `assetlinks.json` |
| `/get` | Share-link fallback, baked into the app's localized strings (28 languages) |
| `/demo.m3u`, `/demo/**` | Submitted to Apple/Google review; referenced by `demo.m3u` itself |
| `/.well-known/*` | iOS Universal Links and Android App Links verification |
| `/sitemap.xml`, `/robots.txt`, `/site.webmanifest`, `/favicon.ico`, `/404.html`, `CNAME` | GitHub Pages / search engines expect them at the root |

The app-side list of these dependencies lives in the app repo at `docs/site/README.md`; update
both when a page moves.

## Conventions

- **Root-absolute links only** (`/assets/css/styles.css`, `/es/faq.html`, `/#pricing`). Pages live
  at three different depths, and absolute paths work from all of them.
- Shared CSS/JS go in `assets/css` and `assets/js`; do not add another inline copy of the navbar
  script to a new page — load `/assets/js/site.js` with `defer`.
- Every indexable page has an `es/` twin; keep the `hreflang` alternates in both pages and in
  `sitemap.xml` in sync. `tv/`, `get/`, the sign-in landings and `404.html` are `noindex`.
- Buttons inside `.legal-content` need the `.legal-content .btn-primary/.btn-secondary` rules in
  `styles.css`; without them the generic `.legal-content a` rule repaints them unreadable.
- Keep individual files under GitHub's 100 MB limit (the demo videos are the only large assets).

## Adding a page

1. Copy the closest existing page (keeps the `<head>`, nav and footer consistent).
2. Use root-absolute links; load `/assets/js/site.js` if the page has the shared nav.
3. Add the `es/` version and the `hreflang` alternates.
4. Add it to `sitemap.xml` unless it is `noindex`.
5. If the app will link to it, add the URL to the "Frozen URLs" table above and to the app repo's
   `docs/site/README.md`.

## Local preview

Any static server works, but it must serve from the repo root so absolute paths resolve:

```
npx serve .
```
