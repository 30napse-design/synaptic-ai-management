import {workspaceUser} from '../../../../lib/workspace-user';
import {canPetty} from '../../../../lib/petty-policy';
import {pettyData} from '../../../../lib/petty-server';
import PettyDesk from '../../../../components/finance/petty-desk';
export const dynamic='force-dynamic';
export default async function Page(){const u=await workspaceUser();if(!canPetty(u))return <main><h1>دسترسی تنخواه ندارید.</h1></main>;return <PettyDesk initialData={await pettyData(u)}/>}
