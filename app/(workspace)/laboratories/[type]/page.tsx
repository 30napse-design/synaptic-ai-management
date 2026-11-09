import {notFound} from 'next/navigation';
import {workspaceUser} from '../../../../lib/workspace-user';
import {canEnterLabs} from '../../../../lib/lab-execution-policy';
import {readLabWorkspace} from '../../../../lib/lab-execution-data';
import LaboratoryWorkspace from '../../../../components/laboratory/laboratory-workspace';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{type:string}>}){const {type}=await params;if(!['internal','external'].includes(type))notFound();const u=await workspaceUser();if(!canEnterLabs(u)||u.laboratory&&u.laboratoryType!==type)return <main><h1>دسترسی به این بخش مجاز نیست.</h1></main>;return <LaboratoryWorkspace key={type} initialData={await readLabWorkspace(u,type)}/>}
