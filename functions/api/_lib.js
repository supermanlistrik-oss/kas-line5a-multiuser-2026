
const COOKIE = "kas5a_session";
const encoder = new TextEncoder();
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2,"0")).join("");
}
export function json(data,status=200,headers={}) {
 return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
}
function token(request){
 const raw=request.headers.get("Cookie")||"";
 const part=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));
 return part?decodeURIComponent(part.slice(COOKIE.length+1)):null;
}
export async function getSession(request,env){
 const t=token(request);if(!t)return null;
 const hash=await sha256(t);
 const row=await env.DB.prepare("SELECT role,expires_at FROM sessions WHERE token_hash=?").bind(hash).first();
 if(!row||row.expires_at<Math.floor(Date.now()/1000))return null;
 return {role:row.role,hash};
}
export async function clearSession(request,env){
 const s=await getSession(request,env);
 if(s)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(s.hash).run();
}
