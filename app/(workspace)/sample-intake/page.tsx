import {workspaceUser} from '../../../lib/workspace-user';
import {readResearchIntake} from '../../../lib/researcher-sample-intake';
import ResearcherSampleIntake from '../../../components/laboratory/researcher-sample-intake';
import IndependentSampleIntake from '../../../components/laboratory/independent-sample-intake';

export const dynamic='force-dynamic';
export default async function SampleIntake({searchParams}:{searchParams:Promise<Record<string,string>>}){
 const user=await workspaceUser(),params=await searchParams;
 // The independent ledger is the PRIMARY reception route; historical mother-case
 // workflow remains available for previously attached samples only on request.
 if(user.laboratory)return <IndependentSampleIntake/>;
 const old=params.legacy==='1'||!!params.id;
 return <><IndependentSampleIntake/>{old?<details className="legacy-linked-intake"><summary>سوابق پذیرش مرتبط با پرونده موجود (اختیاری)</summary><ResearcherSampleIntake initialData={await readResearchIntake(user,new URLSearchParams(params))}/></details>:<div className="legacy-linked-intake"><a href="/sample-intake?legacy=1">سوابق و فرم قدیمی نمونه‌های دارای شماره پرونده</a></div>}</>;
}