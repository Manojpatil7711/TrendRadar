# TrendRadar

**Daily trending updates across major platforms for all content creators worldwide.** Discover public trend signals, breaking stories, category-focused feeds, source links, and content angles in one workspace.

## What this beta includes

- Creator dashboard designed for desktop and mobile.
- 13 discovery areas: Technology & AI, Business & Money, World & Politics, Science & Health, Entertainment, Sports, Gaming, Education & Jobs, Beauty & Lifestyle, Food & Travel, Climate & Nature, Creator Economy, and Everything.
- Region and feed-language selection.
- Public RSS feed aggregation from Google Trends and Google News with original links when supplied.
- Category-specific Google News RSS queries; broad Google Trends items are only categorized when their title/summary actually matches the selected category.
- Topic search, source filters, sorting, and show-more controls.
- Local watchlist stored on the user's device.
- Creator angle studio with format-specific prompts; these are idea starters, not AI-generated research or verified facts.
- Configurable keyword/category browser notifications and periodic feed checks while the page remains open.
- Installable web-app manifest and service worker shell caching.
- Google sign-in, Cloudflare D1-backed account sessions and membership records (requires correctly configured Google OAuth secrets and D1 binding).\n- Pro membership checkout code for Razorpay; live payments remain disabled until Razorpay keys and webhook secret are configured and verified.\n- Privacy and terms pages.

## Accuracy and coverage limits

This is an early beta, **not yet a real-time feed from every social platform**. TikTok, Instagram, YouTube, Facebook, Reddit, LinkedIn and other platforms have different data access rules. They are not represented as connected merely because their names appear in the product roadmap.

Google Trends represents relative search interest, not total searches or social-media video counts. Public RSS feeds do not reliably establish how many posts or videos appeared in the last hour or month across every platform. TrendRadar therefore does not invent those counts, view totals, virality scores, or platform-wide activity figures.

A news item or search signal is not proof that a topic is viral everywhere. Users should open the original source and verify important claims before publishing.

## Notifications

- Users explicitly enable browser notification permission.
- Saved keyword/category preferences are stored locally in this browser.
- Checks repeat at the chosen interval while the website is open and visible.
- Notification support varies by browser and operating system.
- **Background push while the site is closed is not enabled yet.** It requires a secure push-subscription service, VAPID keys, server-side subscription storage, and a scheduled/event-driven sender. Do not advertise this as a finished feature until those parts are implemented and tested.

## Deploy to Cloudflare Pages

This is a static HTML/CSS/JavaScript project with a Pages Function at `functions/api/trends.js`.

1. In Cloudflare, open **Workers & Pages → Create application → Pages → Connect to Git**.
2. Connect `Manojpatil7711/TrendRadar`.
3. Select the `main` production branch.
4. Framework preset: **None**.
5. Build command: `exit 0`.
6. Build output directory: `.` (repository root).
7. Deploy, then verify:
   - `/`
   - `/api/trends?country=IN&language=en&category=all`
   - `/api/trends?country=IN&language=mr&category=sports`
   - `/privacy.html` and `/terms.html`

**Important:** A dashboard deployment must compile and include the `functions` directory. Do not use Cloudflare's dashboard drag-and-drop upload for this version; use Git integration or Wrangler, because the Pages Function is required for the feed endpoint. If the GitHub connection fails, repair/re-authorize the Cloudflare GitHub app before retrying. Do not switch to direct upload if automatic Git deployments are desired.

No paid domain or paid service is needed just to validate the first beta. Confirm the account's current billing and usage separately before enabling any paid service.

## Project files

- `index.html` — dashboard, category explorer, source finder, creator studio and alert preferences
- `styles.css` — responsive design system
- `app.js` — feed rendering, filters, local watchlist, idea prompts and notification settings
- `functions/api/trends.js` — category-aware public RSS aggregation
- `manifest.webmanifest` / `sw.js` — installability and cached app shell
- `privacy.html` / `terms.html` — beta policies

## Next milestones

1. Validate mobile layout, feed results, links, and feed failure states on the deployed preview.
2. Add platform-specific data only after checking each source's terms, access, reliability, and cost.
3. Implement true background push with subscription consent, VAPID, secure storage, abuse controls, and delivery monitoring.
4. Add trend-history and growth indicators only where the underlying data supports the calculation.
5. Validate Google OAuth and Razorpay configuration in a preview environment before enabling account or payment flows in production.\n6. Test demand and operating costs before investing in new data providers or paid services.

Contact: manojpatil7711@gmail.com
