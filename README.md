# TrendRadar

**Daily trending updates across major platforms for all content creators worldwide** — discover public trend signals, breaking topics, country-wise insights, and fresh content angles in one place.

## Current MVP

- Country filter for 14 regions and language preference.
- Public RSS feeds from Google Trends and Google News, with original source links.
- Search/filter, local watchlist, and template-based content-angle ideas.
- Optional browser notifications while the page is open and permission is granted.
- Responsive dashboard with no login, paid API key, or database required for the initial version.
- Cloudflare Pages Function at `/api/trends` fetches the public RSS feeds and caches responses.

## Important accuracy limits

This MVP **does not yet ingest every social platform**. TikTok, Instagram, YouTube, Facebook, Reddit and similar platforms have different access rules and data availability. We do not claim platform-wide coverage until reliable sources or authorized integrations exist.

Public RSS feeds do not reliably establish how many videos/posts were published in the last hour or month across all platforms. TrendRadar therefore does not invent those counts. A feed item is a public trend/news signal, not proof that it is viral on every platform.

Browser notifications work only when supported and permitted by the browser; this MVP does not send background push notifications while the site is closed. Watchlist data is stored locally in the user's browser.

## Deploy on Cloudflare Pages

1. In Cloudflare Dashboard, open **Workers & Pages** and create a Pages project.
2. Connect this GitHub repository: `Manojpatil7711/TrendRadar`.
3. Choose **Direct Upload** only if you can include Pages Functions through a compatible build workflow; Git integration is recommended for this repository.
4. For this plain HTML/CSS/JS project, use the repository root as the build output directory and leave the build command empty.
5. Deploy, then verify the home page and `/api/trends?country=IN&language=en`.

If Cloudflare's setup screen requires a framework preset, choose **None**. Do not add a paid plan or buy a domain just to test the beta.

## Project files

- `index.html` — dashboard structure
- `styles.css` — responsive design
- `app.js` — feed rendering, filters, watchlist, browser alerts, content-angle templates
- `functions/api/trends.js` — RSS aggregation endpoint for Cloudflare Pages

## Roadmap

1. Deploy the no-cost beta and validate feed reliability.
2. Add platform connectors only when access is legitimate, reliable, and affordable.
3. Add real activity metrics with clear source, timeframe, geography, and last-updated timestamp.
4. Consider accounts, saved preferences across devices, and subscription billing only after real user demand and a cost review.

Contact: manojpatil7711@gmail.com
