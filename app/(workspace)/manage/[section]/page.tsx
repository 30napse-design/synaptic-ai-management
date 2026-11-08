import {notFound} from 'next/navigation';
import {workspaceUser} from '../../../../lib/workspace-user';
import ManagerTools from '../../../../components/workspace/manager-tools';
export const dynamic='force-dynamic';
export default async function ManagerPage({params}:{params:Promise<{section:string}>}){const u=await workspaceUser();if(!u.manager)return <main><h1>دسترسی مدیریت لازم است.</h1></main>;const {section}=await params;if(!['finance','mail','lab','projects','management','tariffs','chats'].includes(section))notFound();return <ManagerTools section={section}/>}
