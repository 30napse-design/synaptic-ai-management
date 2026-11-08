import StaffApp from '../../staff/staff-app';
import {workspaceUser} from '../../../lib/workspace-user';
import {readStaffData} from '../../../lib/staff-data';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const query=await searchParams;const u=await workspaceUser();return <StaffApp initialIntent={query.new} initialData={await readStaffData(u)}/>}
