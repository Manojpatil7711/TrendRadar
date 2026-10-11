import { json } from "../auth/_lib.js";
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,"0")).join("");
async function sign(secret,body){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return hex(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(body)));}
function same(a,b){if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0;}
export async function onRequestPost({request,env}) {
 if(!env.MEMBERS_DB||!env.RAZORPAY_WEBHOOK_SECRET)return json({ok:false,error:"Webhook is not configured."},503);
 const raw=await request.text(),received=request.headers.get("x-razorpay-signature")||"";
 if(!same(await sign(env.RAZORPAY_WEBHOOK_SECRET,raw),received))return json({ok:false,error:"Invalid signature."},400);
 let event;try{event=JSON.parse(raw)}catch{return json({ok:false,error:"Invalid JSON."},400)}
 const eventId=request.headers.get("x-razorpay-event-id");if(eventId){const prior=await env.MEMBERS_DB.prepare("SELECT event_id FROM payment_events WHERE event_id=?").bind(eventId).first();if(prior)return json({ok:true,duplicate:true});}
 if(event.event==="payment.captured"||event.event==="order.paid"){
  const entity=event.payload?.payment?.entity||event.payload?.order?.entity;
  const payment=event.payload?.payment?.entity;
  const orderId=payment?.order_id||entity?.id;
  if(orderId&&payment?.status==="captured"&&payment?.amount===19900&&payment?.currency==="INR"){
   const order=await env.MEMBERS_DB.prepare("SELECT order_id,user_id,amount,currency,status,payment_id FROM orders WHERE order_id=?").bind(orderId).first();
   if(order&&order.amount===19900&&order.currency==="INR"&&order.status!=="paid"){
    const now=Math.floor(Date.now()/1000);
    await env.MEMBERS_DB.batch([
     env.MEMBERS_DB.prepare("UPDATE orders SET status='paid',payment_id=?,paid_at=? WHERE order_id=? AND status!='paid'").bind(payment.id,now,orderId),
     env.MEMBERS_DB.prepare("INSERT INTO memberships(user_id,plan,status,starts_at,expires_at,payment_id,updated_at) VALUES(?,'pro','active',?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET plan='pro',status='active',starts_at=CASE WHEN memberships.status='active' AND memberships.expires_at>? THEN memberships.starts_at ELSE excluded.starts_at END,expires_at=MAX(CASE WHEN memberships.status='active' AND memberships.expires_at>? THEN memberships.expires_at ELSE excluded.starts_at END,excluded.starts_at)+2592000,payment_id=excluded.payment_id,updated_at=excluded.updated_at").bind(order.user_id,now,now+2592000,payment.id,now,now,now)
    ]);
   }
  }
 }
 if(eventId)await env.MEMBERS_DB.prepare("INSERT OR IGNORE INTO payment_events(event_id,event_type,received_at) VALUES(?,?,?)").bind(eventId,String(event.event||"unknown"),Math.floor(Date.now()/1000)).run();
 return json({ok:true});
}
