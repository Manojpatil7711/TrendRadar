/* AdSense is intentionally off until a client ID and display slots are configured.
   Fail closed: if membership status cannot be checked, do not load ads. */
(async function(){
  const meta=document.querySelector('meta[name="adsense-client"]');
  const client=(meta?.content||"").trim();
  const slots=[...document.querySelectorAll("[data-adsense-slot]")];
  if(!client || !slots.length) return;
  try {
    const response=await fetch("/api/auth/me",{credentials:"same-origin",cache:"no-store"});
    if(!response.ok) return;
    const data=await response.json();
    const user=data.user;
    const activePro=!!(user&&user.pro&&Number(user.expiresAt)>Math.floor(Date.now()/1000));
    document.documentElement.dataset.plan=activePro?"pro":"free";
    if(activePro) { slots.forEach(slot=>slot.hidden=true); return; }
    slots.forEach(slot=>{slot.hidden=false;const ins=slot.querySelector("ins.adsbygoogle");if(ins){ins.setAttribute("data-ad-client",client);}});
    if(!document.querySelector('script[data-trendradar-adsense="loaded"]')){
      const script=document.createElement("script");
      script.async=true;
      script.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+encodeURIComponent(client);
      script.crossOrigin="anonymous";
      script.dataset.trendradarAdsense="loaded";
      script.onload=()=>{slots.forEach(slot=>{try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch{}})};
      document.head.appendChild(script);
    }
  } catch { /* If auth status cannot be verified, show no ads. */ }
})();
