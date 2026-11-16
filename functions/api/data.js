
import {json,getSession} from "./_lib.js";
export async function onRequestGet({request,env}){
 const s=await getSession(request,env);if(!s)return json({error:"Sesi berakhir. Silakan login kembali."},401);
 const row=await env.DB.prepare("SELECT payload,updated_at FROM app_data WHERE id=1").first();
 let data=null;try{data=row?JSON.parse(row.payload):null;}catch(e){return json({error:"Data kas di server rusak."},500);}
 return json({data,updatedAt:row?.updated_at||null,role:s.role});
}
export async function onRequestPost({request,env}){
 const s=await getSession(request,env);if(!s)return json({error:"Sesi berakhir. Silakan login kembali."},401);
 if(s.role!=="admin")return json({error:"Akun Member hanya memiliki akses baca."},403);
 const text=await request.text();if(text.length>2_000_000)return json({error:"Ukuran data terlalu besar."},413);
 let payload;try{payload=JSON.parse(text);}catch(e){return json({error:"Format data tidak valid."},400);}
 if(!payload||!Array.isArray(payload.members)||!payload.settings)return json({error:"Struktur data kas tidak valid."},400);
 const now=new Date().toISOString();
 await env.DB.prepare("INSERT INTO app_data(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at").bind(JSON.stringify(payload),now).run();
 return json({ok:true,updatedAt:now});
}
