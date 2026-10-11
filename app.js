const $ = (id) => document.getElementById(id);
const countryNames = {IN:"India",US:"United States",GB:"United Kingdom",CA:"Canada",AU:"Australia",BR:"Brazil",DE:"Germany",FR:"France",JP:"Japan",KR:"South Korea",SG:"Singapore",ZA:"South Africa",MX:"Mexico",NG:"Nigeria"};
const newsLocale = {IN:{hl:"en-IN",gl:"IN",ceid:"IN:en"},US:{hl:"en-US",gl:"US",ceid:"US:en"},GB:{hl:"en-GB",gl:"GB",ceid:"GB:en"},CA:{hl:"en-CA",gl:"CA",ceid:"CA:en"},AU:{hl:"en-AU",gl:"AU",ceid:"AU:en"},BR:{hl:"pt-BR",gl:"BR",ceid:"BR:pt-419"},DE:{hl:"de",gl:"DE",ceid:"DE:de"},FR:{hl:"fr",gl:"FR",ceid:"FR:fr"},JP:{hl:"ja",gl:"JP",ceid:"JP:ja"},KR:{hl:"ko",gl:"KR",ceid:"KR:ko"},SG:{hl:"en-SG",gl:"SG",ceid:"SG:en"},ZA:{hl:"en-ZA",gl:"ZA",ceid:"ZA:en"},MX:{hl:"es-419",gl:"MX",ceid:"MX:es-419"},NG:{hl:"en-NG",gl:"NG",ceid:"NG:en"}};
const languageCodes = {en:"en",hi:"hi",mr:"mr",pt:"pt-BR",de:"de",fr:"fr",ja:"ja",ko:"ko",es:"es"};
let allItems = [];
let watchlist = readWatchlist();
function readWatchlist(){try{return JSON.parse(localStorage.getItem("trendradar-watchlist")||"[]")}catch{return []}}
function saveWatchlist(){localStorage.setItem("trendradar-watchlist",JSON.stringify(watchlist));renderWatchlist()}
function safeText(value){return String(value||"").replace(/[<>]/g,"").trim()}
function relativeTime(value){if(!value)return "Recent";const time=Date.parse(value);if(!Number.isFinite(time))return "Recent";const mins=Math.max(0,Math.floor((Date.now()-time)/60000));if(mins<60)return mins<=1?"Just now":mins+"m ago";if(mins<1440)return Math.floor(mins/60)+"h ago";return Math.floor(mins/1440)+"d ago"}
function render(){
 const q=$("search").value.trim().toLocaleLowerCase();
 const filtered=allItems.filter(item=>!q||(item.title+" "+(item.summary||"")).toLocaleLowerCase().includes(q));
 const grid=$("trendGrid");grid.replaceChildren();
 if(!filtered.length){const empty=document.createElement("div");empty.className="empty-state";empty.textContent=allItems.length?"No topics match that search. Try another keyword.":"No feed items were returned. Try refreshing later; no trend data has been fabricated.";grid.append(empty);return}
 filtered.forEach(item=>{
  const card=document.createElement("article");card.className="trend-card";
  const top=document.createElement("div");top.className="card-top";
  const tag=document.createElement("span");tag.className="source-tag";tag.textContent=item.source==="Google Trends"?"TREND SIGNAL":"NEWS SIGNAL";
  const age=document.createElement("span");age.className="age";age.textContent=relativeTime(item.publishedAt);
  top.append(tag,age);
  const title=document.createElement("h3");title.textContent=item.title;
  const summary=document.createElement("p");summary.className="summary";summary.textContent=item.summary||"Open the original source to understand the story and verify details.";
  const bottom=document.createElement("div");bottom.className="card-bottom";
  const link=document.createElement("a");link.className="source-link";link.href=item.url||"#";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Open source ↗";
  const save=document.createElement("button");save.type="button";save.className="save-btn"+(watchlist.some(w=>w.key===item.key)?" saved":"");save.textContent=watchlist.some(w=>w.key===item.key)?"♥ Saved":"♡ Save topic";
  save.addEventListener("click",()=>toggleWatch(item));
  bottom.append(link,save);card.append(top,title,summary,bottom);grid.append(card);
 });
}
function toggleWatch(item){const idx=watchlist.findIndex(w=>w.key===item.key);if(idx>=0)watchlist.splice(idx,1);else watchlist.unshift({key:item.key,title:item.title,url:item.url,source:item.source});watchlist=watchlist.slice(0,30);saveWatchlist();render()}
function renderWatchlist(){const box=$("watchlist");box.replaceChildren();if(!watchlist.length){const span=document.createElement("span");span.className="muted";span.textContent="No saved topics yet.";box.append(span);return}watchlist.forEach(item=>{const chip=document.createElement("span");chip.className="watch-chip";const a=document.createElement("a");a.textContent=item.title;a.href=item.url||"#";a.target="_blank";a.rel="noopener noreferrer";a.style.cssText="color:inherit;text-decoration:none;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";const remove=document.createElement("button");remove.type="button";remove.setAttribute("aria-label","Remove "+item.title);remove.textContent="×";remove.addEventListener("click",()=>{watchlist=watchlist.filter(w=>w.key!==item.key);saveWatchlist();render()});chip.append(a,remove);box.append(chip)})}
async function loadTrends(){
 const country=$("country").value;const language=$("language").value;
 $("regionLabel").textContent=countryNames[country]||country;$("status").className="status";$("status").textContent="Loading public trend signals…";$("refreshBtn").disabled=true;
 try{
  const res=await fetch("/api/trends?country="+encodeURIComponent(country)+"&language="+encodeURIComponent(language),{headers:{accept:"application/json"}});
  const data=await res.json();if(!res.ok)throw new Error(data.error||"Feed unavailable");
  allItems=Array.isArray(data.items)?data.items:[];
  $("updatedAt").textContent="UPDATED "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  $("status").textContent=allItems.length?allItems.length+" public feed items · "+(data.sources||[]).join(" + ")+" · Activity counts are not available from these feeds.":"No feed items available for this region right now.";
  render();
  notifyMatchingTopics();
 }catch(err){
  allItems=[];render();$("status").className="status error";$("status").textContent="Could not load the public feeds. "+(err.message||"Please try again later.")+" The dashboard will not make up live counts.";
  $("updatedAt").textContent="FEED UNAVAILABLE";
 }finally{$("refreshBtn").disabled=false}
}
function notifyMatchingTopics(){if(!("Notification" in window)||Notification.permission!=="granted"||!watchlist.length)return;const found=allItems.find(item=>watchlist.some(w=>item.title.toLowerCase().includes(w.title.toLowerCase())||w.title.toLowerCase().includes(item.title.toLowerCase())));if(found){try{new Notification("TrendRadar watchlist match",{body:found.title})}catch{}}}
const ideaSets={
 short:[t=>"The one thing most people misunderstand about "+t,t=>"3 quick facts about "+t+" that deserve more attention",t=>"Is "+t+" actually worth the hype? Here is what to check."],
 long:[t=>"A beginner-friendly deep dive into "+t+": context, evidence, and what happens next",t=>"I researched "+t+" so you can understand the biggest questions in one video",t=>"The full story behind "+t+"—what is confirmed and what remains unclear"],
 carousel:[t=>"5 things to know about "+t,t=>"Myth vs fact: what people get wrong about "+t,t=>"A simple step-by-step guide to understanding "+t],
 thread:[t=>"A useful thread on "+t+": context first, evidence second, opinion last",t=>"What the conversation around "+t is missing",t=>"3 questions to ask before sharing claims about "+t],
 blog:[t=>"What "+t+" means for beginners: a practical guide",t=>"The evidence, context and open questions behind "+t,t=>"A balanced explainer on "+t with sources worth reading"]
};
function makeIdeas(){const topic=safeText($("ideaTopic").value)||safeText(allItems[0]?.title)||"today's top trend";$("ideaTopic").value=topic;const type=$("format").value;const templates=ideaSets[type]||ideaSets.short;const box=$("ideaResults");box.replaceChildren();const intros=["Hook: start with a specific question or surprising verified fact.","Structure: explain the context, show evidence, then share your point of view.","Trust check: link your sources and clearly label opinion, estimates, and unknowns."];templates.forEach((fn,i)=>{const card=document.createElement("article");card.className="idea-card";const label=document.createElement("span");label.textContent="ANGLE 0"+(i+1);const title=document.createElement("p");title.textContent=fn(topic);const note=document.createElement("p");note.style.color="var(--muted)";note.textContent=intros[i];const copy=document.createElement("button");copy.type="button";copy.className="save-btn";copy.style.marginTop="12px";copy.textContent="Copy angle";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(fn(topic));copy.textContent="Copied"}catch{copy.textContent="Select text to copy"}});card.append(label,title,note,copy);box.append(card)})}
$("refreshBtn").addEventListener("click",loadTrends);$("country").addEventListener("change",loadTrends);$("language").addEventListener("change",loadTrends);$("search").addEventListener("input",render);$("ideaBtn").addEventListener("click",makeIdeas);$("notifyBtn").addEventListener("click",async()=>{if(!("Notification" in window)){alert("Browser notifications are not supported on this device.");return}try{const permission=await Notification.requestPermission();$("notifyBtn").textContent=permission==="granted"?"Alerts enabled":permission==="denied"?"Alerts blocked":"Enable alerts";if(permission==="granted")new Notification("TrendRadar alerts enabled",{body:"Watchlist matches can notify you while this site is open."})}catch{$("notifyBtn").textContent="Alerts unavailable"}});
renderWatchlist();loadTrends();
