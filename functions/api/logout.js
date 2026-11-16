
import {json,getSession} from "./_lib.js";
export async function onRequestPost({request,env}){
 const s=await getSession(request,env);
 if(s)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(s.hash).run();
 return json({ok:true},200,{"set-cookie":"kas5a_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
}
