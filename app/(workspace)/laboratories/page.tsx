import LaboratoryCenter from '../../../components/laboratory/laboratory-center';
import {readLaboratoryCenter} from '../../../lib/laboratory-center';
import {workspaceUser} from '../../../lib/workspace-user';
export const dynamic='force-dynamic';
export default async function Laboratories({searchParams}:{searchParams:Promise<Record<string,string>>}){const u=await workspaceUser(),q=await searchParams;return <LaboratoryCenter initialData={await readLaboratoryCenter(u,new URLSearchParams(q))} initialQuery={q}/>;}
