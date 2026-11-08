import StaffApp from '../../staff/staff-app';
import {workspaceUser} from '../../../lib/workspace-user';
import {readStaffData} from '../../../lib/staff-data';
export const dynamic='force-dynamic';
export default async function Page(){const u=await workspaceUser();return <StaffApp initialData={await readStaffData(u)}/>}
