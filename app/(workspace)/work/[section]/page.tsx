import {notFound} from 'next/navigation';
import StaffApp from '../../../staff/staff-app';
import {workspaceUser} from '../../../../lib/workspace-user';
import {readStaffData} from '../../../../lib/staff-data';
import {hasAccess,moduleKinds} from '../../../../lib/auth-policy';
export const dynamic='force-dynamic';
export default async function Work({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!moduleKinds[section])notFound();const u=await workspaceUser();if(!hasAccess(u,section))return <main><h1>دسترسی به این بخش مجاز نیست</h1></main>;return <StaffApp key={section} section={section} initialData={await readStaffData(u)}/>}
