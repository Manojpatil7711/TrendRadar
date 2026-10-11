import { json, fail, originOk, setCookie, sha256, passwordHash, equal, randomToken, requireJson, emailValid } from "./_lib.js";
export async function onRequestPost({request,env}) {
 if(!originOk(request)) return fail("Request origin not allowed.",403);
 if(!env.MEMBERS_DB) return fail("Account service is not configured yet.",503);
 const body=await requireJson(request); if(!body) return fail("Enter your email and password.");
 const email=String(body.email||"").trim().toLowerCase(), password=String(body.password||"");
 if(!emailValid(email)||password.length>128) return fail("Email or password is incorrect.",401);
 const emailHash=await sha256(email), now=Math.floor(Date.now()/1000);
 const attempt=await env.MEMBERS_DB.prepare("SELECT attempts,window_started,blocked_until FROM auth_attempts WHERE email_hash=?").bind(emailHash).first();
 if(attempt && Number(attempt.blocked_until)>now) return fail("Too many attempts. Please wait 15 minutes and try again.",429);
 const user=await env.MEMBERS_DB.prepare("SELECT id,email,password_salt,password_hash FROM users WHERE email=?").bind(email).first();
 const candidate=user?await passwordHash(password,user.password_salt):await passwordHash(password,"AAAAAAAAAAAAAAAAAAAAAA");
 if(!user || !equal(candidate,user.password_hash)) {
  const start=attempt && now-Number(attempt.window_started)<900?Number(attempt.window_started):now;
  const count=attempt && start===Number(attempt.window_started)?Number(attempt.attempts)+1:1;
  await env.MEMBERS_DB.prepare("INSERT INTO auth_attempts(email_hash,attempts,window_started,blocked_until) VALUES(?,?,?,?) ON CONFLICT(email_hash) DO UPDATE SET attempts=excluded.attempts,window_started=excluded.window_started,blocked_until=excluded.blocked_until").bind(emailHash,count,start,count>=8?now+900:0).run();
  return fail("Email or password is incorrect.",401);
 }
 await env.MEMBERS_DB.prepare("DELETE FROM auth_attempts WHERE email_hash=?").bind(emailHash).run();
 const token=randomToken(), tokenHash=await sha256(token);
 await env.MEMBERS_DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").bind(tokenHash,user.id,now+7*24*60*60,now).run();
 const member=await env.MEMBERS_DB.prepare("SELECT plan,status,expires_at FROM memberships WHERE user_id=?").bind(user.id).first();
 const pro=member?.plan==="pro" && member?.status==="active" && Number(member?.expires_at)>now;
 return json({ok:true,user:{email:user.email,plan:pro?"pro":"free",pro,expiresAt:pro?Number(member.expires_at):null}},200,{"set-cookie":setCookie(token)});
}
