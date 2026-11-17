import LaboratoryMotherWorkspace from '../../../../components/laboratory/laboratory-mother-workspace';
import {canMother,readMother} from '../../../../lib/laboratory-mother';
import ScienceWorkspace from '../../../../components/science/science-workspace';
import {readScienceData} from '../../../../lib/science-data';
import {canScience} from '../../../../lib/science-policy';
import FinanceWorkspace from '../../../../components/workspace/finance-workspace';
import {redirect} from 'next/navigation';
import InstituteOverview from '../../../../components/workspace/institute-overview';
import LabDesk from '../../../../components/laboratory/lab-desk';
import {readLabData} from '../../../../lib/lab-data';
import {notFound} from 'next/navigation';
import StaffApp from '../../../staff/staff-app';
import {workspaceUser} from '../../../../lib/workspace-user';
import {readStaffData} from '../../../../lib/staff-data';
import {hasAccess,moduleKinds} from '../../../../lib/auth-policy';
export const dynamic='force-dynamic';
export default async function Work({params,searchParams}:{params:Promise<{section:string}>,searchParams:Promise<Record<string,string>>}){const {section}=await params;const u=await workspaceUser();if(u.laboratory&&section!=='lab')redirect('/laboratories/'+u.laboratoryType);if(section==='lab'&&(await searchParams).legacy!=='1'){if(!canMother(u)&&!u.laboratory&&!hasAccess(u,'finance_ops'))return <main><h1>دسترسی مرکز مادر ندارید</h1></main>;const params=await searchParams;return <LaboratoryMotherWorkspace initialData={await readMother(u,new URLSearchParams(params))}/>;}if(section==='desks')redirect('/operations');if(section==='finance')redirect(u.manager||hasAccess(u,'finance_ops')?'/finance/dashboard':'/operations?category=billing');if(section==='science'&&(await searchParams).legacy!=='1')return canScience(u)?<ScienceWorkspace initialData={await readScienceData(u)} initialCaseId={(await searchParams).case||''}/>:<main><h1>دسترسی به این بخش مجاز نیست</h1></main>;if(section==='leadership')return u.manager?<InstituteOverview/>:<main><h1>این بخش مخصوص مدیریت است.</h1></main>;if(!moduleKinds[section])notFound();if(!hasAccess(u,section))return <main><h1>دسترسی به این بخش مجاز نیست</h1></main>;return <StaffApp key={section} section={section} initialData={await readStaffData(u)}/>}
