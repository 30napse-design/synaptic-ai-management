import OperationsApp from '../../operations/operations-app';
import {workspaceUser} from '../../../lib/workspace-user';
import {readOperationsData} from '../../../lib/operations-data';
import {canUseOps} from '../../../lib/ops-policy';
export const dynamic='force-dynamic';
export default async function OperationsPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const u=await workspaceUser();if(!canUseOps(u))return <main><h1>دسترسی به این بخش مجاز نیست</h1></main>;const raw=await searchParams;const initialFilters=Object.fromEntries(Object.entries(raw).filter(([,v])=>typeof v==='string'));const p=new URLSearchParams(initialFilters as Record<string,string>);return <OperationsApp initialData={await readOperationsData(u,p)} initialFilters={initialFilters}/>}
