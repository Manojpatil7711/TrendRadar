const COOKIE = "tr_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers } });
const fail = (message, status = 400) => json({ ok: false, error: message }, status);
function originOk(request) { const origin = request.headers.get("Origin"); return !origin || origin === new URL(request.url).origin; }
function cookie(request) { const raw = request.headers.get("Cookie") || ""; const part = raw.split(";").map(v => v.trim()).find(v => v.startsWith(COOKIE + "=")); return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : ""; }
function setCookie(token) { return COOKIE + "=" + encodeURIComponent(token) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + SESSION_SECONDS; }
function clearCookie() { return COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"; }
function b64(bytes) { let s = ""; for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function fromB64(value) { const s = value.replace(/-/g,"+").replace(/_/g,"/"); const bin = atob(s + "=".repeat((4-s.length%4)%4)); return Uint8Array.from(bin, c => c.charCodeAt(0)); }
async function sha256(text) { return b64(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))); }
async function passwordHash(password, salt) { const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]); const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:fromB64(salt),iterations:150000,hash:"SHA-256"},key,256); return b64(bits); }
function equal(a,b) { if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false; let out=0; for(let i=0;i<a.length;i++) out |= a.charCodeAt(i)^b.charCodeAt(i); return out===0; }
function randomToken(bytes=32) { const a = new Uint8Array(bytes); crypto.getRandomValues(a); return b64(a); }
async function sessionUser(request, env) { const token = cookie(request); if (!token || !env.MEMBERS_DB) return null; const tokenHash = await sha256(token); const now = Math.floor(Date.now()/1000); const row = await env.MEMBERS_DB.prepare("SELECT u.id,u.email,s.expires_at AS session_expires,m.plan,m.status AS member_status,m.expires_at AS member_expires FROM sessions s JOIN users u ON u.id=s.user_id LEFT JOIN memberships m ON m.user_id=u.id WHERE s.token_hash=? AND s.expires_at>?").bind(tokenHash,now).first(); if (!row) return null; const pro = row.plan==="pro" && row.member_status==="active" && Number(row.member_expires)>now; return {id:row.id,email:row.email,plan:pro?"pro":"free",pro,expiresAt:pro?Number(row.member_expires):null}; }
async function requireJson(request) { try { return await request.json(); } catch { return null; } }
function emailValid(email) { return typeof email==="string" && email.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function uid() { return crypto.randomUUID(); }
export { json, fail, originOk, cookie, setCookie, clearCookie, sha256, passwordHash, equal, randomToken, sessionUser, requireJson, emailValid, uid };
