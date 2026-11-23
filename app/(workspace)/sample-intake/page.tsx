import {workspaceUser} from '../../../lib/workspace-user';
import {readResearchIntake} from '../../../lib/researcher-sample-intake';
import ResearcherSampleIntake from '../../../components/laboratory/researcher-sample-intake';
import IndependentSampleIntake from '../../../components/laboratory/independent-sample-intake';
export const dynamic='force-dynamic';
export default async function SampleIntake({searchParams}:{searchParams:Promise<Record<string,string>>}){
 const user=await workspaceUser();
 if(user.laboratory)return <IndependentSampleIntake/>;
 const params=await searchParams;
 const linked=params.legacy==='1'||!!params.id;
 return <><IndependentSampleIntake/>{linked?<details open className="legacy-linked-intake"><summary>پذیرش مرتبط با پرونده و فاکتور موجود (روش قبلی و اختیاری)</summary><ResearcherSampleIntake initialData={await readResearchIntake(user,new URLSearchParams(params))}/></details>:<div className="legacy-linked-intake"><a href="/sample-intake?legacy=1">مشاهده سوابق و فرم پذیرش پرونده‌های دارای فاکتور</a></div>}</>;
}
