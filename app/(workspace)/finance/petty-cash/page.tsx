import {workspaceUser} from '../../../../lib/workspace-user';
import {canPetty} from '../../../../lib/petty-policy';
import {pettyWorkspace} from '../../../../lib/petty-workflow';
import PettyDesk from '../../../../components/finance/petty-desk';
export const dynamic='force-dynamic';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const u=await workspaceUser();if(!canPetty(u))return <main><h1>دسترسی تنخواه ندارید.</h1></main>;return <PettyDesk initialData={await pettyWorkspace(u,new URLSearchParams(await searchParams))}/>}
