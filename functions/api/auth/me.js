import { json, sessionUser } from "./_lib.js";
export async function onRequestGet({request,env}) { const user=await sessionUser(request,env); return json({ok:true,user:user?{email:user.email,plan:user.plan,pro:user.pro,expiresAt:user.expiresAt}:null}); }
