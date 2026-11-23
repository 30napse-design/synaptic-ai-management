import {workspaceUser} from '../../../lib/workspace-user';
import {readResearchIntake} from '../../../lib/researcher-sample-intake';
import ResearcherSampleIntake from '../../../components/laboratory/researcher-sample-intake';
import IndependentSampleIntake from '../../../components/laboratory/independent-sample-intake';
export const dynamic='force-dynamic';
export default async function SampleIntake({searchParams}:{searchParams:Promise<Record<string,string>>}){
 const user=await workspaceUser();
 if(user.laboratory)return <IndependentSampleIntake/>;
 const filters=new URLSearchParams(await searchParams);
 return <><IndependentSampleIntake/><details className="legacy-linked-intake"><summary>پذیرش نمونه مرتبط با پرونده و فاکتور موجود (روش قبلی، اختیاری)</summary><ResearcherSampleIntake initialData={await readResearchIntake(user,filters)}/></details></>;
}
