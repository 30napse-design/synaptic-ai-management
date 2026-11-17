import {workspaceUser} from '../../../lib/workspace-user';
import {readResearchIntake} from '../../../lib/researcher-sample-intake';
import ResearcherSampleIntake from '../../../components/laboratory/researcher-sample-intake';
export const dynamic='force-dynamic';
export default async function SampleIntake({searchParams}:{searchParams:Promise<Record<string,string>>}){return <ResearcherSampleIntake initialData={await readResearchIntake(await workspaceUser(),new URLSearchParams(await searchParams))}/>;}
