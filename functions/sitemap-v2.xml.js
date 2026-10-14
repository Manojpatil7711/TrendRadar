const XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://trendradar-c30.pages.dev/</loc><lastmod>2026-10-14</lastmod></url>
  <url><loc>https://trendradar-c30.pages.dev/privacy.html</loc><lastmod>2026-10-14</lastmod></url>
  <url><loc>https://trendradar-c30.pages.dev/terms.html</loc><lastmod>2026-10-14</lastmod></url>
</urlset>`;

export function onRequestGet() {
  return new Response(XML, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
