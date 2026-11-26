import CommunicationEngine from '../../../components/workspace/communication-engine';
import {readDispatch} from '../../../lib/dispatch-engine';
import OperationsApp from '../../operations/operations-app';
import {workspaceUser} from '../../../lib/workspace-user';
import {readOperationsData} from '../../../lib/operations-data';
import {canUseOps} from '../../../lib/ops-policy';
export const dynamic='force-dynamic';
export default async function OperationsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const u=await workspaceUser();const requested=await searchParams;if(requested.view==='dispatch'){const params=new URLSearchParams(Object.entries(requested).filter(([,v])=>typeof v==='string') as [string,string][]);try{return <CommunicationEngine initialData={await readDispatch(u,params.get('id')?new URLSearchParams({view:'dispatch'}):params)}/>}catch(e:any){return <main><h1>{e.message}</h1></main>}}if(!canUseOps(u))return <main><h1>دسترسی به این بخش مجاز نیست</h1></main>;const raw=await searchParams;const initialFilters=Object.fromEntries(Object.entries(raw).filter(([,v])=>typeof v==='string'));const p=new URLSearchParams(initialFilters as Record<string,string>);if(p.get('view')==='tickets'){p.set('pageSize','5');if(!p.has('sortOrder'))p.set('sortOrder','asc')}try{return <OperationsApp initialData={await readOperationsData(u,p)} initialFilters={initialFilters}/>;}catch(e:any){console.error('operations page data load failed',e?.code||e?.message||'unknown');return <OperationsApp initialData={null} initialFilters={initialFilters}/>;}}
