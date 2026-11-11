import {isWork} from '../../../lib/work-policy';
import {redirect} from 'next/navigation';
import WorkApp from '../../staff/work-app';
import StaffApp from '../../staff/staff-app';
import {workspaceUser} from '../../../lib/workspace-user';
import {readStaffData} from '../../../lib/staff-data';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const query=await searchParams;const u=await workspaceUser();if(u.laboratory)redirect('/laboratories/'+u.laboratoryType);const data=await readStaffData(u);return (['invoices','resellers','team'].includes(query.view)||!!query.id&&data.records.some((r:any)=>r.id===query.id&&!isWork(r)))?<StaffApp initialIntent={query.new} initialData={data}/>:<WorkApp initialData={data}/>}
