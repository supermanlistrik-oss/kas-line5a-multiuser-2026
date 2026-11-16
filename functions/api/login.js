
import {json} from "./_lib.js";
const COOKIE="kas5a_session";
const enc=new TextEncoder();
async function hash(v){const d=await crypto.subtle.digest("SHA-256",enc.encode(v));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,"0")).join("");}
export async function onRequestPost({request,env}){
 const b=await request.json().catch(()=>null);
 if(!b||!["admin","member"].includes(b.role)||typeof b.password!=="string")return json({error:"Data login tidak valid."},400);
 const expected=b.role==="admin"?env.ADMIN_PASSWORD:env.MEMBER_PASSWORD;
 if(!expected||b.password.length>256||b.password!==expected)return json({error:"Password salah atau belum dikonfigurasi."},401);
 const token=crypto.randomUUID()+crypto.randomUUID(),tokenHash=await hash(token);
 const expiry=Math.floor(Date.now()/1000)+2592000;
 await env.DB.prepare("INSERT INTO sessions(token_hash,role,expires_at) VALUES(?,?,?)").bind(tokenHash,b.role,expiry).run();
 return json({ok:true,role:b.role},200,{"set-cookie":`${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`});
}
