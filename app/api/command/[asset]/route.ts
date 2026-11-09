import {restrictLegacyDeletion} from '../../../../lib/deletion-policy';
import { legacy } from '../../../../lib/legacy';
import { identity } from '../../../../lib/staff-server';
import { entryScript } from '../../../../lib/entry';
export const dynamic='force-dynamic';
export async function GET(_:Request,{params}:{params:Promise<{asset:string}>}){
 const user=await identity();
 if(!user)return new Response('Forbidden',{status:403});
 const {asset}=await params;
 const shared=['style.css','entry.js'];
 if(!user.manager&&!shared.includes(asset))return new Response('Forbidden',{status:403});
 if(!['app.js','style.css','tariffs-data.js','entry.js'].includes(asset))return new Response('Not found',{status:404});
 const body=asset==='entry.js'?entryScript:legacy[asset as keyof typeof legacy];
 return new Response(asset==='app.js'?restrictLegacyDeletion(body,user):body,{headers:{'Content-Type':asset.endsWith('.css')?'text/css; charset=utf-8':'application/javascript; charset=utf-8','Cache-Control':'no-store'}});
}
