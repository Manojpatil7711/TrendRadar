const NEWS = {
 IN:{hl:"en-IN",gl:"IN",ceid:"IN:en"},US:{hl:"en-US",gl:"US",ceid:"US:en"},GB:{hl:"en-GB",gl:"GB",ceid:"GB:en"},CA:{hl:"en-CA",gl:"CA",ceid:"CA:en"},AU:{hl:"en-AU",gl:"AU",ceid:"AU:en"},BR:{hl:"pt-BR",gl:"BR",ceid:"BR:pt-419"},DE:{hl:"de",gl:"DE",ceid:"DE:de"},FR:{hl:"fr",gl:"FR",ceid:"FR:fr"},JP:{hl:"ja",gl:"JP",ceid:"JP:ja"},KR:{hl:"ko",gl:"KR",ceid:"KR:ko"},SG:{hl:"en-SG",gl:"SG",ceid:"SG:en"},ZA:{hl:"en-ZA",gl:"ZA",ceid:"ZA:en"},MX:{hl:"es-419",gl:"MX",ceid:"MX:es-419"},NG:{hl:"en-NG",gl:"NG",ceid:"NG:en"}
};
const LANGS={en:"en",hi:"hi",mr:"mr",pt:"pt-BR",de:"de",fr:"fr",ja:"ja",ko:"ko",es:"es"};
const LOCALE={en:{hl:"en",ceid:"en"},hi:{hl:"hi-IN",ceid:"hi"},mr:{hl:"mr-IN",ceid:"mr"},pt:{hl:"pt-BR",ceid:"pt-419"},de:{hl:"de",ceid:"de"},fr:{hl:"fr",ceid:"fr"},ja:{hl:"ja",ceid:"ja"},ko:{hl:"ko",ceid:"ko"},es:{hl:"es-419",ceid:"es-419"}};
const CATEGORIES={all:"",technology:"artificial intelligence OR technology OR apps OR gadgets",business:"business OR finance OR markets OR startups",world:"world news OR politics OR breaking news",science:"science OR health research OR medicine",entertainment:"entertainment OR movies OR music OR celebrities",sports:"sports OR cricket OR football OR tennis",gaming:"gaming OR video games OR esports",education:"education OR careers OR jobs OR exams",lifestyle:"beauty OR fashion OR skincare OR lifestyle",food:"food OR travel OR tourism",climate:"climate OR environment OR wildlife OR energy",creators:"creator economy OR social media creators OR influencer"};
const LOCAL_TERMS={
 hi:{technology:"तकनीक OR आर्टिफिशियल इंटेलिजेंस OR एआई",business:"व्यापार OR अर्थव्यवस्था OR शेयर बाजार",world:"विश्व समाचार OR राजनीति OR ताजा खबर",science:"विज्ञान OR स्वास्थ्य OR शोध",entertainment:"मनोरंजन OR फिल्म OR संगीत",sports:"खेल OR क्रिकेट OR फुटबॉल",gaming:"गेमिंग OR वीडियो गेम",education:"शिक्षा OR नौकरी OR परीक्षा",lifestyle:"फैशन OR सुंदरता OR स्वास्थ्य",food:"खाना OR यात्रा OR पर्यटन",climate:"जलवायु OR पर्यावरण OR मौसम",creators:"कंटेंट क्रिएटर OR सोशल मीडिया OR इन्फ्लुएंसर"},
 mr:{technology:"तंत्रज्ञान OR कृत्रिम बुद्धिमत्ता OR एआय",business:"व्यवसाय OR अर्थव्यवस्था OR शेअर बाजार",world:"जागतिक बातम्या OR राजकारण OR ताज्या बातम्या",science:"विज्ञान OR आरोग्य OR संशोधन",entertainment:"मनोरंजन OR चित्रपट OR संगीत",sports:"क्रीडा OR क्रिकेट OR फुटबॉल",gaming:"गेमिंग OR व्हिडिओ गेम",education:"शिक्षण OR नोकरी OR परीक्षा",lifestyle:"फॅशन OR सौंदर्य OR आरोग्य",food:"खाद्य OR प्रवास OR पर्यटन",climate:"हवामान OR पर्यावरण",creators:"कंटेंट क्रिएटर OR सोशल मीडिया OR इन्फ्लुएन्सर"},
 pt:{technology:"inteligência artificial OR tecnologia OR aplicativos",business:"negócios OR economia OR mercado financeiro",world:"notícias mundiais OR política OR últimas notícias",science:"ciência OR saúde OR pesquisa",entertainment:"entretenimento OR cinema OR música",sports:"esportes OR futebol OR tênis",gaming:"jogos OR videogames OR esports",education:"educação OR empregos OR exames",lifestyle:"beleza OR moda OR bem-estar",food:"comida OR viagens OR turismo",climate:"clima OR meio ambiente",creators:"criadores de conteúdo OR redes sociais"},
 de:{technology:"künstliche Intelligenz OR Technologie OR Apps",business:"Wirtschaft OR Finanzen OR Börse OR Startups",world:"Weltnachrichten OR Politik OR Eilmeldungen",science:"Wissenschaft OR Gesundheit OR Forschung",entertainment:"Unterhaltung OR Film OR Musik",sports:"Sport OR Fußball OR Tennis",gaming:"Gaming OR Videospiele",education:"Bildung OR Jobs OR Prüfungen",lifestyle:"Beauty OR Mode OR Wellness",food:"Essen OR Reisen OR Tourismus",climate:"Klima OR Umwelt",creators:"Content Creator OR soziale Medien"},
 fr:{technology:"intelligence artificielle OR technologie OR applications",business:"économie OR finance OR marchés OR startups",world:"actualités internationales OR politique OR dernières nouvelles",science:"science OR santé OR recherche",entertainment:"divertissement OR cinéma OR musique",sports:"sport OR football OR tennis",gaming:"jeux vidéo OR gaming",education:"éducation OR emplois OR examens",lifestyle:"beauté OR mode OR bien-être",food:"cuisine OR voyage OR tourisme",climate:"climat OR environnement",creators:"créateurs de contenu OR réseaux sociaux"},
 ja:{technology:"人工知能 OR テクノロジー OR アプリ",business:"ビジネス OR 経済 OR 株式市場",world:"世界ニュース OR 政治 OR 速報",science:"科学 OR 健康 OR 研究",entertainment:"エンタメ OR 映画 OR 音楽",sports:"スポーツ OR 野球 OR サッカー",gaming:"ゲーム OR eスポーツ",education:"教育 OR 求人 OR 試験",lifestyle:"美容 OR ファッション OR 健康",food:"料理 OR 旅行 OR 観光",climate:"気候 OR 環境",creators:"クリエイター OR ソーシャルメディア"},
 ko:{technology:"인공지능 OR 기술 OR 앱",business:"비즈니스 OR 경제 OR 주식시장",world:"세계 뉴스 OR 정치 OR 속보",science:"과학 OR 건강 OR 연구",entertainment:"엔터테인먼트 OR 영화 OR 음악",sports:"스포츠 OR 야구 OR 축구",gaming:"게임 OR e스포츠",education:"교육 OR 채용 OR 시험",lifestyle:"뷰티 OR 패션 OR 웰니스",food:"음식 OR 여행 OR 관광",climate:"기후 OR 환경",creators:"크리에이터 OR 소셜 미디어"},
 es:{technology:"inteligencia artificial OR tecnología OR aplicaciones",business:"negocios OR economía OR mercados OR startups",world:"noticias mundiales OR política OR última hora",science:"ciencia OR salud OR investigación",entertainment:"entretenimiento OR cine OR música",sports:"deportes OR fútbol OR tenis",gaming:"videojuegos OR esports",education:"educación OR empleo OR exámenes",lifestyle:"belleza OR moda OR bienestar",food:"comida OR viajes OR turismo",climate:"clima OR medio ambiente",creators:"creadores de contenido OR redes sociales"}
};
function decodeXml(value=""){return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()}
function tag(xml,name){const escaped=name.replace(/[.*+?^\${}()|[\]\\]/g,"\\$&");const m=xml.match(new RegExp("<(?:[\\w.-]+:)?"+escaped+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?"+escaped+"\\s*>","i"));return m?decodeXml(m[1]):""}
function matchesFeedLanguage(title,language){
 // Unicode ranges are intentionally real regex escapes, not literal backslash text.
 if(language==="en")return !/[\u0E00-\u0E7F\u0C00-\u0C7F\u0B80-\u0BFF\u0D00-\u0D7F\u0900-\u097F\u3040-\u30FF\uAC00-\uD7AF\u4E00-\u9FFF]/u.test(title);
 if(language==="ja")return /[\u3040-\u30FF\u4E00-\u9FFF]/u.test(title);
 if(language==="ko")return /[\uAC00-\uD7AF]/u.test(title);
 if(language==="hi"||language==="mr")return /[\u0900-\u097F]/u.test(title);
 if(language==="pt"||language==="de"||language==="fr"||language==="es")return true;
 return true;
}
function parseFeed(xml,source,limit=40,category="all",country="IN"){const chunks=xml.match(/<(?:item|entry)(?:\s[^>]*)?>[\s\S]*?<\/(?:item|entry)\s*>/gi)||[];return chunks.slice(0,limit).map(chunk=>{const title=tag(chunk,"title");let link=tag(chunk,"link");if(!link){const m=chunk.match(/<link[^>]+href=["']([^"']+)["']/i);if(m)link=m[1]}const guid=tag(chunk,"guid")||tag(chunk,"id");const pub=tag(chunk,"pubDate")||tag(chunk,"published")||tag(chunk,"updated");const desc=tag(chunk,"description")||tag(chunk,"summary")||tag(chunk,"content");if(!title)return null;const feedUrl="https://trends.google.com/trending/rss?geo="+encodeURIComponent(country);const directLink=source==="Google Trends"&&(!link||link===feedUrl||link.includes("/trending/rss"))?"https://trends.google.com/trends/explore?q="+encodeURIComponent(title)+"&geo="+encodeURIComponent(country):(link||"");return{key:source+":"+((guid||link||title).slice(0,220)),title,url:directLink,summary:desc.slice(0,260),publishedAt:pub,source,category}}).filter(x=>x&&x.title)}
async function fetchFeed(url,source,limit,category,country="IN",language="en"){
 const headers={"accept":"application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8","user-agent":"Mozilla/5.0 (compatible; TrendRadar/0.3; public RSS reader)"};
 const candidates=[{url,source}];
 if(source==="Google News"){
  const parsed=new URL(url),params=new URLSearchParams(parsed.search);
  const fallback=new URLSearchParams(params);
  fallback.set("q",params.get("q")||"when:1d");
  candidates.push({url:"https://news.google.com/rss/search?"+fallback.toString(),source:"Google News"});
  const query=params.get("q")||"India latest news";
  const bingLang=({en:"en-IN",hi:"hi-IN",mr:"mr-IN",pt:"pt-BR",de:"de-DE",fr:"fr-FR",ja:"ja-JP",ko:"ko-KR",es:"es-ES"})[language]||"en-IN";
  candidates.push({url:"https://www.bing.com/news/search?q="+encodeURIComponent(query)+"&format=rss&setlang="+encodeURIComponent(bingLang),source:"Bing News"});
 }
 let lastError;
 for(const candidate of candidates){
  try{
   const response=await fetch(candidate.url,{headers,signal:AbortSignal.timeout(8500)});
   if(!response.ok)throw new Error(candidate.source+" feed returned "+response.status);
   const xml=await response.text(),items=parseFeed(xml,candidate.source,limit,category,country);
   if(items.length)return items;
   lastError=new Error(candidate.source+" feed returned no parseable items");
  }catch(error){lastError=error}
 }
 throw lastError||new Error(source+" feed unavailable")
}
export async function onRequestGet(context){
 const request=new URL(context.request.url),country=(request.searchParams.get("country")||"IN").toUpperCase(),language=(request.searchParams.get("language")||"en").toLowerCase(),category=(request.searchParams.get("category")||"all").toLowerCase(),breaking=request.searchParams.get("breaking")==="1";
 if(!NEWS[country]||!LANGS[language]||!Object.hasOwn(CATEGORIES,category))return Response.json({error:"Unsupported country, language, or category."},{status:400,headers:{"cache-control":"no-store"}});
 const cacheKey=new Request(request.origin+"/api/trends?country="+country+"&language="+language+"&category="+category+"&breaking="+(breaking?"1":"0")),cache=typeof caches!=="undefined"?caches.default:null;
 if(cache){const cached=await cache.match(cacheKey);if(cached)return cached}
 const locale={...NEWS[country]};if(language!=="en"){locale.hl=LOCALE[language].hl;locale.ceid=country+":"+LOCALE[language].ceid}
 const trendsUrl="https://trends.google.com/trending/rss?geo="+encodeURIComponent(country);
 const newsLocale={...locale};if(breaking)newsLocale.q="when:6h";else if(CATEGORIES[category])newsLocale.q=(LOCAL_TERMS[language]&&LOCAL_TERMS[language][category])||CATEGORIES[category];
 const newsUrl="https://news.google.com/rss?"+new URLSearchParams(newsLocale).toString();
 const tasks=[fetchFeed(trendsUrl,"Google Trends",40,"all",country,language),fetchFeed(newsUrl,"Google News",50,category,country,language)];
 // Additional free public newsroom feeds provide source diversity when English is selected.
 // They are used as supplementary signals, never presented as country-specific metrics.
 if(language==="en")tasks.push(fetchFeed("https://feeds.bbci.co.uk/news/world/rss.xml","BBC News",20,category,country,language),fetchFeed("https://www.aljazeera.com/xml/rss/all.xml","Al Jazeera",20,category,country,language));
 const results=await Promise.allSettled(tasks);
 const items=[],sources=[],errors=[];
 results.forEach((result,index)=>{if(result.status==="fulfilled"){let feedItems=result.value;if(index===0)feedItems=feedItems.filter(item=>matchesFeedLanguage(item.title,language));if(breaking&&index===0)feedItems=[];items.push(...feedItems);if(feedItems.length)sources.push(feedItems[0].source)}else errors.push(result.reason?.message||"Feed unavailable")});
 const unique=[...new Map(items.filter(i=>i.title).map(i=>[i.key,i])).values()].sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0)).slice(0,80);
 const payload={country,language,category,breaking,items:unique,sources,generatedAt:new Date().toISOString(),note:breaking?"Latest headlines are filtered to a recent six-hour window where the provider supports it; this is not a guarantee of a verified breaking-news alert. Google Trends is a search-interest signal, not a view count.":"Google Trends signals are country-specific. Google News and Bing News follow the selected country/language where supported; BBC and Al Jazeera are supplementary global English sources. Public RSS feeds do not provide reliable cross-platform video counts.",warnings:errors};
 const response=Response.json(payload,{headers:{"cache-control":"public, max-age=60, s-maxage=300","x-content-type-options":"nosniff"}});
 if(cache)context.waitUntil(cache.put(cacheKey,response.clone()));
 return response;
}