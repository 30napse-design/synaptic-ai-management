import {notFound,redirect} from 'next/navigation';
import {workspaceUser} from '../../../../lib/workspace-user';
import {canFinance} from '../../../../lib/finance-policy';
import {readFinanceData} from '../../../../lib/finance-data';
import FinanceDesk from '../../../../components/finance/finance-desk';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!['dashboard','pricing','invoices','contracts','receipts','payables','ledger','compare'].includes(section))notFound();const u=await workspaceUser();if(u.laboratory)redirect('/laboratories/'+u.laboratoryType);if(!canFinance(u))return <main><h1>دسترسی مالی ندارید.</h1><p>این بخش به مجوز مستقل مالی نیاز دارد.</p></main>;return <FinanceDesk key={section} section={section} initialData={await readFinanceData(u)}/>}
