import { json, fail, originOk, sessionUser, uid } from "../auth/_lib.js";
export async function onRequestPost({request,env}) {
 if(!originOk(request)) return fail("Request origin not allowed.",403);
 const user=await sessionUser(request,env); if(!user) return fail("Sign in before purchasing Pro.",401);
 if(user.pro) return json({ok:true,alreadyPro:true,expiresAt:user.expiresAt});
 if(!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return fail("Secure checkout is not enabled yet. Please check back after payment setup is complete.",503);
 const now=Math.floor(Date.now()/1000), receipt="tr_"+uid().replace(/-/g,"").slice(0,24);
 const response=await fetch("https://api.razorpay.com/v1/orders",{method:"POST",headers:{authorization:"Basic "+btoa(env.RAZORPAY_KEY_ID+":"+env.RAZORPAY_KEY_SECRET),"content-type":"application/json"},body:JSON.stringify({amount:19900,currency:"INR",receipt,notes:{product:"TrendRadar Pro 30-day access",user_id:user.id}})});
 const order=await response.json().catch(()=>null); if(!response.ok || !order?.id) return fail("Could not start checkout. Please try again later.",502);
 await env.MEMBERS_DB.prepare("INSERT INTO orders(order_id,user_id,amount,currency,status,created_at) VALUES(?,?,19900,'INR','created',?)").bind(order.id,user.id,now).run();
 return json({ok:true,orderId:order.id,amount:19900,currency:"INR",keyId:env.RAZORPAY_KEY_ID,name:"TrendRadar",description:"Pro access for 30 days",email:user.email});
}
