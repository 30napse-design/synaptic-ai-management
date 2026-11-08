import {workspaceUser} from '../../lib/workspace-user';
import {readHomeData} from '../../lib/home-data';
import {dailyMessage} from '../../lib/home-policy';
import PersonalHome from '../../components/workspace/personal-home';
export const dynamic='force-dynamic';
export default async function Home(){const u=await workspaceUser();return <PersonalHome u={u} d={await readHomeData(u)} message={dailyMessage()}/>}