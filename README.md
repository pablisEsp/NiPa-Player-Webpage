# NiPa Player — website

Static marketing site for [www.nipaplayer.com](https://www.nipaplayer.com), served by
**Firebase Hosting** (project `nipa-player`, default site). There is no build step: the repository
root *is* the site, and every push to `main` deploys it through
[`.github/workflows/firebase-hosting.yml`](.github/workflows/firebase-hosting.yml). What gets
uploaded, the response headers and the URL behaviour are all defined in [`firebase.json`](firebase.json).

> **Migration status (2026-09-16):** the site is still served by GitHub Pages until the DNS cutover
> in [Hosting](#hosting) is done. Both workflows deploy on every push during the transition; delete
> `deploy.yml`, `CNAME` and the Pages custom domain once the cutover is verified.

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
├── 404.html            Branded 404 (Firebase Hosting serves it for any unknown path)
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
├── CNAME               GitHub Pages custom domain — delete after the Hosting cutover
├── robots.txt, sitemap.xml, site.webmanifest, favicon.ico
├── firebase.json       Hosting config: upload ignore list, headers, URL behaviour
├── .firebaserc         Firebase project alias (nipa-player)
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
| `/sitemap.xml`, `/robots.txt`, `/site.webmanifest`, `/favicon.ico`, `/404.html` | Hosting / search engines expect them at the root |

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
  Hosting's free quota is 10 GB stored and 360 MB/day transferred (then $0.15/GB); the whole site
  is ~47 MB, 44 MB of it the demo clips, so do not add more large media without checking usage.
- Do not enable `cleanUrls` or `trailingSlash` in `firebase.json`: every Frozen URL above must keep
  answering `200` at its exact path, with no redirect (Apple's and Google's deep-link verifiers
  refuse redirected responses).

## Adding a page

1. Copy the closest existing page (keeps the `<head>`, nav and footer consistent).
2. Use root-absolute links; load `/assets/js/site.js` if the page has the shared nav.
3. Add the `es/` version and the `hreflang` alternates.
4. Add it to `sitemap.xml` unless it is `noindex`.
5. If the app will link to it, add the URL to the "Frozen URLs" table above and to the app repo's
   `docs/site/README.md`.

## Hosting

Firebase Hosting, project `nipa-player`, default site (`nipa-player.web.app`). The Firebase CLI is
not a dependency of the repo; run it with `npx firebase-tools`.

### Deploys

- **CI** (`firebase-hosting.yml`): every push to `main` deploys to the live channel with
  `FirebaseExtended/action-hosting-deploy`. It needs the repository secret
  `FIREBASE_SERVICE_ACCOUNT_NIPA_PLAYER` (a service-account JSON). The easiest way to create both
  the account and the secret is `npx firebase-tools init hosting:github` from a machine logged in
  to Firebase and GitHub; answer "no" to overwriting the workflow files.
- **PR previews** (`firebase-hosting-pull-request.yml`, generated by the CLI): every pull request
  from this repo gets a temporary preview URL posted as a PR comment.
- **Manual**: `npx firebase-tools deploy --only hosting` after `npx firebase-tools login`.
- **Preview**: `npx firebase-tools hosting:channel:deploy <name>` gives a temporary
  `nipa-player--<name>-<hash>.web.app` URL (expires in 7 days) for checking a change before merging.

### Custom domain

`www.nipaplayer.com` is the canonical host (the app's deep links, the `.well-known` files and every
Frozen URL use it). DNS lives at Hostinger (`ns1/ns2.dns-parking.com`), which also hosts the
`@nipaplayer.com` mailboxes: **only the `A`/`AAAA`/`CNAME` records for `@` and `www` change; leave
`MX` and `TXT` alone.**

Cutover from GitHub Pages, one time:

1. Firebase console → Hosting → *Add custom domain* → `www.nipaplayer.com`, then add
   `nipaplayer.com` as a **redirect** to `www.nipaplayer.com` (the apex must redirect, not serve).
2. Add the records the console shows at Hostinger (`A` records for `@` and `www`, plus the
   ownership `TXT` if asked). Delete the four `185.199.x.153` GitHub `A` records on `@` and the
   `www → pablisesp.github.io` CNAME.
3. Wait for the certificate (minutes to a few hours), then verify:
   ```
   curl -sI https://www.nipaplayer.com/ | head -3                       # 200, no "Server: GitHub.com"
   curl -sI https://nipaplayer.com/ | head -3                           # 301 → https://www.nipaplayer.com/
   curl -sI https://www.nipaplayer.com/tv | head -3                     # 301 → /tv/ (same as before)
   curl -sI https://www.nipaplayer.com/tv/ | head -3                    # 200
   curl -sI https://www.nipaplayer.com/.well-known/apple-app-site-association | grep -i content-type   # application/json
   curl -sI https://www.nipaplayer.com/.well-known/assetlinks.json | head -3
   curl -sI https://www.nipaplayer.com/demo.m3u | head -3
   ```
4. Decommission Pages: delete `.github/workflows/deploy.yml` and `CNAME`, and clear the custom
   domain in the GitHub repo settings (Pages). Also update the app repo's `docs/site/README.md`
   and `docs/tv_deeplink/README.md` if the host ever changes (it should not).

Behaviour verified against the Hosting emulator (2026-09-16): every Frozen URL answers exactly as
on GitHub Pages — `/tv` and `/get` still `301` to the trailing-slash form and `/tv/`, `/get/`
answer `200`; `/nope` renders the branded `404.html`; `demo.m3u` is served as `audio/x-mpegurl`.
What changes: the AASA file gets `Content-Type: application/json`, and every response carries
`nosniff` / `X-Frame-Options` / `Referrer-Policy` (from `firebase.json`).

Two things about `firebase.json` that look wrong but are deliberate:

- The `ignore` list does **not** contain Firebase's default `**/.*` entry, because that would drop
  `.well-known/` from the upload and silently break iOS/Android deep-link verification. Dotfiles
  that must not ship are listed one by one instead.
- `ignore` only applies to the upload. The local emulator serves everything in the folder
  (`README.md`, `firebase.json`, `.github/`…); that is expected and does not happen on the deployed
  site.

**Windows emulator bug**: `headers` rules never match in the emulator on Windows (its
`glob-slasher` dependency turns the request path into backslashes, which `minimatch` does not
match). URL behaviour and the 404 can be checked locally; headers can only be checked on a
preview channel or on the live site with the `curl` commands above.

## Local preview

Any static server works, but it must serve from the repo root so absolute paths resolve:

```
npx serve .
```

To check headers and URL behaviour exactly as production will serve them, use the Hosting
emulator instead (no login needed):

```
npx firebase-tools emulators:start --only hosting --project demo-nipa
```
