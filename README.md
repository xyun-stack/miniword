# miniword

Motion library for LCD keypads (xpad mini, StreamDock, and friends).

A curated catalogue of GIFs pre-cropped and color-tuned for small displays.
Built with Next.js 15, Tailwind v4, React 19.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Refresh the catalogue

The on-disk catalogue lives at `lib/seeds.json`, populated by a build-time
crawler that hits Tenor's public search endpoint.

```bash
npm run crawl        # rewrites lib/seeds.json
```

Optional env vars: `TENOR_API_KEY`, `GIPHY_API_KEY` (defaults are public test keys).

## Project structure

```
app/              Next.js App Router pages (/, /browse, /gif/[slug], /liked, /upload)
components/       UI primitives (GifCard, DeviceFrame, LikeButton, Header, …)
hooks/            React hooks (useLikes — localStorage-backed)
lib/              devices.ts, sample-data.ts, seeds.json
scripts/crawl.mjs Tenor/Giphy crawler
```

## Notes

- GIFs are hotlinked from Tenor's CDN. No copy is stored.
- Likes persist locally per device (no backend).
- Devices currently supported: xpad mini (240×135), StreamDock 15 (128×128), StreamDock N3 (96×96).
