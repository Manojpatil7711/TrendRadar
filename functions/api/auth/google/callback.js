import { randomToken, sha256, passwordHash, setCookie, uid } from "../_lib.js";

function getCookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const part = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return part ? part.slice(name.length + 1) : "";
}

function redirect(request, error) {
  const headers = new Headers({
    Location: new URL("/account.html?error=" + error, request.url).toString(),
    "Cache-Control": "no-store"
  });
  headers.append("Set-Cookie", "tr_google_state=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return new Response(null, { status: 302, headers });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const saved = getCookie(request, "tr_google_state");

  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.MEMBERS_DB) {
    return redirect(request, "google_not_configured");
  }
  if (!code || !state || !saved || state !== saved) {
    return redirect(request, "google_failed");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: new URL("/api/auth/google/callback", request.url).toString(),
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) return redirect(request, "google_failed");

    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: "Bearer " + tokenData.access_token }
    });
    const google = await userResponse.json();
    if (!userResponse.ok || !google.sub || !google.email || google.email_verified !== true) {
      return redirect(request, "google_failed");
    }

    const now = Math.floor(Date.now() / 1000);
    const email = String(google.email).trim().toLowerCase();
    const linked = await env.MEMBERS_DB.prepare(
      "SELECT user_id FROM oauth_accounts WHERE provider='google' AND provider_user_id=?"
    ).bind(google.sub).first();

    let userId = linked?.user_id;
    if (!userId) {
      const existing = await env.MEMBERS_DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
      userId = existing?.id;
      if (!userId) {
        userId = uid();
        const salt = randomToken(16);
        const hash = await passwordHash(randomToken(48), salt);
        await env.MEMBERS_DB.batch([
          env.MEMBERS_DB.prepare("INSERT INTO users(id,email,password_salt,password_hash,created_at) VALUES(?,?,?,?,?)").bind(userId, email, salt, hash, now),
          env.MEMBERS_DB.prepare("INSERT INTO memberships(user_id,plan,status,updated_at) VALUES(?,'free','inactive',?)").bind(userId, now)
        ]);
      }
      await env.MEMBERS_DB.prepare(
        "INSERT INTO oauth_accounts(provider,provider_user_id,user_id,created_at) VALUES('google',?,?,?)"
      ).bind(google.sub, userId, now).run();
    }

    const token = randomToken();
    const tokenHash = await sha256(token);
    await env.MEMBERS_DB.prepare(
      "INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)"
    ).bind(tokenHash, userId, now + 7 * 24 * 60 * 60, now).run();

    const headers = new Headers({
      Location: new URL("/account.html", request.url).toString(),
      "Cache-Control": "no-store"
    });
    headers.append("Set-Cookie", setCookie(token));
    headers.append("Set-Cookie", "tr_google_state=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    return new Response(null, { status: 302, headers });
  } catch (error) {
    console.error("Google sign-in failed", error);
    return redirect(request, "google_failed");
  }
}
