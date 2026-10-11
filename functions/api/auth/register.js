import { json, fail, originOk, setCookie, sha256, passwordHash, randomToken, requireJson, emailValid, uid } from "./_lib.js";
export async function onRequestPost({request,env}) {
 if(!originOk(request)) return fail("Request origin not allowed.",403);
 if(!env.MEMBERS_DB) return fail("Account service is not configured yet.",503);
 const body=await requireJson(request); if(!body) return fail("Enter your email and password.");
 const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
 if(!emailValid(email)) return fail("Enter a valid email address.");
 if(password.length<12 || password.length>128) return fail("Use a password with 12–128 characters.");
 const existing=await env.MEMBERS_DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
 if(existing) return fail("An account may already exist for this email. Try signing in.",409);
 const salt=randomToken(16), hash=await passwordHash(password,salt), id=uid(), now=Math.floor(Date.now()/1000), token=randomToken();
 try {
  await env.MEMBERS_DB.batch([
   env.MEMBERS_DB.prepare("INSERT INTO users (id,email,password_salt,password_hash,created_at) VALUES (?,?,?,?,?)").bind(id,email,salt,hash,now),
   env.MEMBERS_DB.prepare("INSERT INTO memberships (user_id,plan,status,updated_at) VALUES (?,'free','inactive',?)").bind(id,now),
   env.MEMBERS_DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at,created_at) VALUES (?,?,?,?)").bind(await sha256(token),id,now+7*24*60*60,now)
  ]);
 } catch { return fail("Could not create the account. Please try again.",500); }
 return json({ok:true,user:{email,plan:"free",pro:false,expiresAt:null}},201,{"set-cookie":setCookie(token)});
}
