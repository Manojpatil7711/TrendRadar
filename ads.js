/* AdSense Auto ads: do not block ad delivery on a login/membership API.
   Ads can only serve when the publisher account/site is approved and Auto ads are enabled.
   No click-triggered popups, popunders, forced redirects, or ad-refresh loops. */
(function(){
  const client=(document.querySelector('meta[name="adsense-client"]')?.content||"").trim();
  if(!/^ca-pub-\d+$/.test(client)) return;
  const existing=document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
  if(existing) return;
  const script=document.createElement("script");
  script.async=true;
  script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(client);
  script.crossOrigin="anonymous";
  document.head.appendChild(script);
})();
