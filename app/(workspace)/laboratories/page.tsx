import LaboratoryMotherWorkspace from '../../../components/laboratory/laboratory-mother-workspace';
import {readMother} from '../../../lib/laboratory-mother';
import {workspaceUser} from '../../../lib/workspace-user';
export const dynamic='force-dynamic';
export default async function Laboratories({searchParams}:{searchParams:Promise<Record<string,string>>}){const u=await workspaceUser();return <LaboratoryMotherWorkspace initialData={await readMother(u,new URLSearchParams(await searchParams))}/>;}
