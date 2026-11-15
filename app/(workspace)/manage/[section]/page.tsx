import {redirect} from 'next/navigation';
import {notFound} from 'next/navigation';
import {workspaceUser} from '../../../../lib/workspace-user';
import ReadOnlyResources from '../../../../components/workspace/readonly-resources';
import {hasAccess} from '../../../../lib/auth-policy';
import {sharedResourceSections,sharedResourcePayload,readTariffBanks} from '../../../../lib/shared-resources';
import {legacy} from '../../../../lib/legacy';
import ManagerTools from '../../../../components/workspace/manager-tools';
export const dynamic='force-dynamic';
export default async function ManagerPage({params,searchParams}:{params:Promise<{section:string}>,searchParams:Promise<Record<string,string>>}){const u=await workspaceUser();const {section}=await params;if(!u.manager){const scope=section==='tariffs'?'tariffs':section==='management'?'development':'resources';if(!sharedResourceSections.includes(section)||!hasAccess(u,scope))return <main><h1>دسترسی به این بخش مجاز نیست.</h1></main>;return <ReadOnlyResources section={section} data={sharedResourcePayload(section,section==='tariffs'?readTariffBanks(legacy['tariffs-data.js']):[])}/>}if(section==='finance'&&(await searchParams).resources!=='1')redirect('/finance/dashboard');if(!['finance','mail','lab','projects','management','tariffs','chats'].includes(section))notFound();return <ManagerTools section={section}/>}
