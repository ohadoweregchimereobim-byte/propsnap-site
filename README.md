# PropSnap

PropSnap is a Chrome extension for researching UK residential property listings on Rightmove, Zoopla and OpenRent.

- Landing page: `index.html`, live at https://propsnap-site.vercel.app (hosted on Vercel)
- [Privacy policy](PRIVACY.md), also published as https://propsnap-site.vercel.app/privacy
- Questions, problems or ideas: [open an issue](https://github.com/ohadoweregchimereobim-byte/propsnap-site/issues/new)

Everything PropSnap saves stays in your own Chrome. There is no PropSnap server, no account, no adverts and no tracking.

## Editing the landing page

- **Hosting:** Vercel deploys every push to `main`, and every pull request gets its own preview link. `vercel.json` holds the settings: no framework, the site is this folder, short URLs (`/privacy`), and a build step that turns `PRIVACY.md` into `privacy.html`.
- **Privacy policy:** edit `PRIVACY.md` only. `tools/build-privacy.mjs` makes `privacy.html` from it on each deploy (run `node tools/build-privacy.mjs` to see it locally). The Chrome Web Store links to `PRIVACY.md` on GitHub, so keep this repo public.
- **Web address:** if the address changes (for example to your own domain), change `propsnap-site.vercel.app` in `index.html` and `tools/build-privacy.mjs`.

- **Links:** the Chrome Web Store link (`chromewebstore.google.com/detail/ddcjkdlbipmbgdielbhfnbcodddoemjd`) and the feedback link (`.../propsnap-site/issues/new`) are written straight into `index.html`. Search for them to change them, for example to a Google Form for feedback.
- **Calculator:** `site.js` holds the same 2026/27 stamp duty and Land Transaction Tax tables as the extension (`src/services/calculators.ts`). Update both each April.
- **Look:** `site.css` holds the colours and layout. `scrollcraft.js` and `scrollcraft.css` are the scroll engine from [scroll-craft](https://github.com/nateherkai/scroll-craft) (MIT, see `scrollcraft-LICENSE.txt`); do not edit them.
- **Fonts:** Geist and Geist Mono, hosted here (SIL Open Font License, see `fonts/OFL.txt`), so the page makes no calls to other sites.
- **Images:** `img/` holds real PropSnap screens with made-up homes, and `img/og.png`, the picture shown when the link is shared.
