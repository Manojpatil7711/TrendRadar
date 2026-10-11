import { json, fail, originOk, sessionUser, requireJson } from "../auth/_lib.js";
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
async function signature(secret,value){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value)));}
function same(a,b){if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;}
async function activate(env,order,paymentId,now){const existing=await env.MEMBERS_DB.prepare("SELECT status,payment_id FROM orders WHERE order_id=?").bind(order.order_id).first();if(!existing)return false;if(existing.status==="paid")return existing.payment_id===paymentId;await env.MEMBERS_DB.batch([
 env.MEMBERS_DB.prepare("UPDATE orders SET status='paid',payment_id=?,paid_at=? WHERE order_id=? AND status!='paid'").bind(paymentId,now,order.order_id),
 env.MEMBERS_DB.prepare("INSERT INTO memberships(user_id,plan,status,starts_at,expires_at,payment_id,updated_at) VALUES(?,'pro','active',?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan='pro',status='active',starts_at=CASE WHEN memberships.status='active' AND memberships.expires_at>? THEN memberships.starts_at ELSE excluded.starts_at END,expires_at=MAX(CASE WHEN memberships.status='active' AND memberships.expires_at>? THEN memberships.expires_at ELSE excluded.starts_at END,excluded.starts_at)+2592000,payment_id=excluded.payment_id,updated_at=excluded.updated_at").bind(order.user_id,now,now+2592000,paymentId,now,now,now)
]);return true;}
export async function onRequestPost({request,env}) {
 if(!originOk(request))return fail("Request origin not allowed.",403);
 const user=await sessionUser(request,env);if(!user)return fail("Sign in to verify this payment.",401);
 if(!env.RAZORPAY_KEY_ID||!env.RAZORPAY_KEY_SECRET)return fail("Secure checkout is not configured.",503);
 const body=await requireJson(request);if(!body)return fail("Payment response is missing.");
 const orderId=String(body.razorpay_order_id||""),paymentId=String(body.razorpay_payment_id||""),sig=String(body.razorpay_signature||"");
 const order=await env.MEMBERS_DB.prepare("SELECT order_id,user_id,amount,currency,status,payment_id FROM orders WHERE order_id=? AND user_id=?").bind(orderId,user.id).first();
 if(!order||order.amount!==19900||order.currency!=="INR")return fail("Order could not be verified.",400);
 if(!same(await signature(env.RAZORPAY_KEY_SECRET,orderId+"|"+paymentId),sig))return fail("Payment signature verification failed.",400);
 const response=await fetch("https://api.razorpay.com/v1/payments/"+encodeURIComponent(paymentId),{headers:{authorization:"Basic "+btoa(env.RAZORPAY_KEY_ID+":"+env.RAZORPAY_KEY_SECRET)}});
 const payment=await response.json().catch(()=>null);
 if(!response.ok||!payment||payment.order_id!==orderId||payment.amount!==19900||payment.currency!=="INR"||payment.status!=="captured")return fail("Payment is not captured yet. Access has not been changed.",409);
 const ok=await activate(env,order,paymentId,Math.floor(Date.now()/1000));if(!ok)return fail("Could not activate membership. Contact support with your payment ID.",500);
 return json({ok:true,plan:"pro",expiresAt:Math.floor(Date.now()/1000)+2592000});
}
