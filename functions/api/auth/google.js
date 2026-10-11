import { randomToken } from "./_lib.js";
export async function onRequestGet({request,env}) {
 if(!env.GOOGLE_CLIENT_ID) return Response.redirect(new URL("/account.html?error=google_not_configured",request.url).toString(),302);
 const state=randomToken(32),url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
 url.searchParams.set("client_id",env.GOOGLE_CLIENT_ID);
 url.searchParams.set("redirect_uri",new URL("/api/auth/google/callback",request.url).toString());
 url.searchParams.set("response_type","code");
 url.searchParams.set("scope","openid email");
 url.searchParams.set("state",state);
 url.searchParams.set("prompt","select_account");
 const response=Response.redirect(url.toString(),302);
 response.headers.append("Set-Cookie","tr_google_state="+state+"; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600");
 return response;
}
