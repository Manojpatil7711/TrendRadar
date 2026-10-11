const NEWS = {
 IN:{hl:"en-IN",gl:"IN",ceid:"IN:en"},US:{hl:"en-US",gl:"US",ceid:"US:en"},GB:{hl:"en-GB",gl:"GB",ceid:"GB:en"},CA:{hl:"en-CA",gl:"CA",ceid:"CA:en"},AU:{hl:"en-AU",gl:"AU",ceid:"AU:en"},BR:{hl:"pt-BR",gl:"BR",ceid:"BR:pt-419"},DE:{hl:"de",gl:"DE",ceid:"DE:de"},FR:{hl:"fr",gl:"FR",ceid:"FR:fr"},JP:{hl:"ja",gl:"JP",ceid:"JP:ja"},KR:{hl:"ko",gl:"KR",ceid:"KR:ko"},SG:{hl:"en-SG",gl:"SG",ceid:"SG:en"},ZA:{hl:"en-ZA",gl:"ZA",ceid:"ZA:en"},MX:{hl:"es-419",gl:"MX",ceid:"MX:es-419"},NG:{hl:"en-NG",gl:"NG",ceid:"NG:en"}
};
const LANGS={en:"en",hi:"hi",mr:"mr",pt:"pt-BR",de:"de",fr:"fr",ja:"ja",ko:"ko",es:"es"};
const CATEGORIES={all:"",technology:"artificial intelligence OR technology OR apps OR gadgets",business:"business OR finance OR markets OR startups",world:"world news OR politics OR breaking news",science:"science OR health research OR medicine",entertainment:"entertainment OR movies OR music OR celebrities",sports:"sports OR cricket OR football OR tennis",gaming:"gaming OR video games OR esports",education:"education OR careers OR jobs OR exams",lifestyle:"beauty OR fashion OR skincare OR lifestyle",food:"food OR travel OR tourism",climate:"climate OR environment OR wildlife OR energy",creators:"creator economy OR social media creators OR influencer"};
function decodeXml(value=""){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/\s+/g," ").trim()}
function tag(xml,name){const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");const m=xml.match(new RegExp("<(?:[\\w.-]+:)?"+escaped+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?"+escaped+"\\s*>","i"));return m?decodeXml(m[1]):""}
function parseFeed(xml,source,limit=25,category="all",country="IN"){const chunks=xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)\s*>/gi)||[];return chunks.slice(0,limit).map(chunk=>{const title=tag(chunk,"title");let link=tag(chunk,"link");if(!link){const m=chunk.match(/<link[^>]+href=["']([^"']+)["']/i);if(m)link=m[1]}const guid=tag(chunk,"guid")||tag(chunk,"id");const pub=tag(chunk,"pubDate")||tag(chunk,"published")||tag(chunk,"updated");const desc=tag(chunk,"description")||tag(chunk,"summary")||tag(chunk,"content");if(!title)return null;const feedUrl="https://trends.google.com/trending/rss?geo="+encodeURIComponent(country);const directLink=source==="Google Trends"&&(!link||link===feedUrl||link.includes("/trending/rss"))?"https://trends.google.com/trends/explore?q="+encodeURIComponent(title)+"&geo="+encodeURIComponent(country):(link||"");return{key:source+":"+((guid||link||title).slice(0,220)),title,url:directLink,summary:desc.slice(0,260),publishedAt:pub,source,category}}).filter(x=>x&&x.title)}
async function fetchFeed(url,source,limit,category,country="IN"){
 const headers={"accept":"application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8","user-agent":"TrendRadar/0.3 (public RSS reader)"};
 const urls=[url];
 if(source==="Google News"){
  const parsed=new URL(url),params=new URLSearchParams(parsed.search);
  if(!params.has("q"))params.set("q","when:1d");
  urls.push("https://news.google.com/rss/search?"+params.toString());
 }
 let lastError;
 for(const candidate of [...new Set(urls)]){
  try{
   const response=await fetch(candidate,{headers,signal:AbortSignal.timeout(3500)});
   if(!response.ok)throw new Error(source+" feed returned "+response.status);
   const xml=await response.text(),items=parseFeed(xml,source,limit,category,country);
   if(items.length||candidate===urls[urls.length-1])return items;
   lastError=new Error(source+" feed returned no parseable items");
  }catch(error){lastError=error}
 }
 throw lastError||new Error(source+" feed unavailable");
}
export async function onRequestGet(context){
 const request=new URL(context.request.url),country=(request.searchParams.get("country")||"IN").toUpperCase(),language=(request.searchParams.get("language")||"en").toLowerCase(),category=(request.searchParams.get("category")||"all").toLowerCase();
 if(!NEWS[country]||!LANGS[language]||!Object.hasOwn(CATEGORIES,category))return Response.json({error:"Unsupported country, language, or category."},{status:400,headers:{"cache-control":"no-store"}});
 const locale={...NEWS[country]};
 if(language!=="en"){locale.hl=language==="hi"?"hi-IN":language==="pt"?"pt-BR":language==="es"?"es-419":LANGS[language];locale.ceid=country+":"+(language==="pt"?"pt-419":language==="es"?"es-419":LANGS[language])}
 const cacheKey=new Request(request.origin+"/api/trends?country="+country+"&language="+language+"&category="+category);
 const cache=typeof caches!=="undefined"?caches.default:null;
 if(cache){const cached=await cache.match(cacheKey);if(cached)return cached}
 const trendsUrl="https://trends.google.com/trending/rss?geo="+encodeURIComponent(country);
 const newsLocale={...locale};if(CATEGORIES[category])newsLocale.q=CATEGORIES[category];
 const newsUrl="https://news.google.com/rss?"+new URLSearchParams(newsLocale).toString();
 const results=await Promise.allSettled([fetchFeed(trendsUrl,"Google Trends",25,"all",country),fetchFeed(newsUrl,"Google News",35,category,country)]);
 const items=[],sources=[],errors=[];
 results.forEach(result=>{if(result.status==="fulfilled"){items.push(...result.value);if(result.value.length)sources.push(result.value[0].source)}else errors.push(result.reason?.message||"Feed unavailable")});
 const unique=[...new Map(items.filter(i=>i.title).map(i=>[i.key,i])).values()].sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0)).slice(0,60);
 const payload={country,language,category,items:unique,sources,generatedAt:new Date().toISOString(),note:"Signals come from public RSS feeds. These feeds do not provide reliable cross-platform post or video volume, so no such counts are shown.",warnings:errors};
 const response=Response.json(payload,{headers:{"cache-control":"public, max-age=60, s-maxage=300","x-content-type-options":"nosniff"}});
 if(cache)context.waitUntil(cache.put(cacheKey,response.clone()));
 return response;
}