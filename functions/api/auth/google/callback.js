import { randomToken, sha256, setCookie, uid } from "../_lib.js";

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
    console.error("Google sign-in state validation failed", {
      hasCode: Boolean(code), hasState: Boolean(state), hasSavedState: Boolean(saved), stateMatches: Boolean(state && saved && state === saved)
    });
    return redirect(request, "google_state_failed");
  }

  let tokenData;
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
    tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google OAuth token exchange rejected", { status: tokenResponse.status, error: tokenData.error || "missing_access_token" });
      return redirect(request, "google_token_failed");
    }
  } catch (error) {
    console.error("Google OAuth token exchange request failed", String(error));
    return redirect(request, "google_token_failed");
  }

  let google;
  try {
    const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { authorization: "Bearer " + tokenData.access_token }
    });
    google = await userResponse.json();
    if (!userResponse.ok || !google.sub || !google.email || google.email_verified !== true) {
      console.error("Google userinfo response rejected", { status: userResponse.status, hasSub: Boolean(google.sub), hasEmail: Boolean(google.email), emailVerified: google.email_verified === true });
      return redirect(request, "google_profile_failed");
    }
  } catch (error) {
    console.error("Google userinfo request failed", String(error));
    return redirect(request, "google_profile_failed");
  }

  let stage = "lookup_account";
  try {
    const now = Math.floor(Date.now() / 1000);
    const email = String(google.email).trim().toLowerCase();

    stage = "lookup_google_link";
    const linked = await env.MEMBERS_DB.prepare(
      "SELECT user_id FROM oauth_accounts WHERE provider='google' AND provider_user_id=?"
    ).bind(google.sub).first();

    let userId = linked?.user_id;
    if (!userId) {
      stage = "lookup_email";
      const existing = await env.MEMBERS_DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
      userId = existing?.id;
      if (!userId) {
        userId = uid();
        stage = "prepare_user";
        // Google-only accounts do not receive a password. Store an independent,
        // unguessable placeholder so OAuth account creation does not depend on
        // password derivation; the password-login verifier cannot match this value.
        const salt = randomToken(16);
        const hash = randomToken(32);

        stage = "insert_user";
        // Handle two Google callbacks arriving at nearly the same time for the same email.
        await env.MEMBERS_DB.prepare(
          "INSERT OR IGNORE INTO users(id,email,password_salt,password_hash,created_at) VALUES(?,?,?,?,?)"
        ).bind(userId, email, salt, hash, now).run();

        // If another request created the same email first, continue with that stable user ID.
        const savedUser = await env.MEMBERS_DB.prepare(
          "SELECT id FROM users WHERE email=?"
        ).bind(email).first();
        if (!savedUser?.id) {
          throw new Error("User insert completed without a readable user row");
        }
        userId = savedUser.id;

        stage = "insert_membership";
        await env.MEMBERS_DB.prepare(
          "INSERT OR IGNORE INTO memberships(user_id,plan,status,updated_at) VALUES(?,'free','inactive',?)"
        ).bind(userId, now).run();
      }

      stage = "link_google_account";
      await env.MEMBERS_DB.prepare(
        "INSERT INTO oauth_accounts(provider,provider_user_id,user_id,created_at) VALUES('google',?,?,?)"
      ).bind(google.sub, userId, now).run();
    }

    stage = "insert_session";
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
    console.error("Google account/session creation failed at stage:", stage, String(error));
    return redirect(request, "google_" + stage + "_failed");
  }
}
