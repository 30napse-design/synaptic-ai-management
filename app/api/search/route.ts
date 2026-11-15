import {identity,json} from '../../../lib/staff-server';
import {globalSearch} from '../../../lib/global-search';
export const dynamic='force-dynamic';
export async function GET(req:Request){const u=await identity();if(!u)return json({error:'ابتدا وارد شوید'},401);try{return json({items:await globalSearch(u,new URL(req.url).searchParams.get('q')||'')})}catch{return json({error:'جست‌وجو در دسترس نیست.'},503)}}
