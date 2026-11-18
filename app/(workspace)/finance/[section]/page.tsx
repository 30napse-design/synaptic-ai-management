import PaymentRequests from '../../../../components/finance/payment-requests';
import {readPaymentRequests} from '../../../../lib/payment-requests';
import {readCustomerReceipts} from '../../../../lib/finance-receipts';
import FinancialDashboard from '../../../../components/finance/financial-dashboard';
import {financeDashboardModel} from '../../../../lib/finance-dashboard';
import {notFound,redirect} from 'next/navigation';
import {workspaceUser} from '../../../../lib/workspace-user';
import {canQuote,quoteOnly} from '../../../../lib/finance-policy';
import {readFinanceData} from '../../../../lib/finance-data';
import FinanceDesk from '../../../../components/finance/finance-desk';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{section:string}>,searchParams:Promise<Record<string,string>>}){const {section}=await params;if(!['dashboard','pricing','invoices','contracts','receipts','payables','ledger','compare'].includes(section))notFound();const u=await workspaceUser();if(u.laboratory)redirect('/laboratories/'+u.laboratoryType);if(section==='payables'){try{return <PaymentRequests initialData={await readPaymentRequests(u,new URLSearchParams(await searchParams))}/>}catch(e:any){return <main><h1>پرداخت‌ها و هزینه‌ها</h1><p>{e.status?e.message:'خواندن صفحه ممکن نشد.'}</p></main>}}if(!canQuote(u)||quoteOnly(u)&&section!=='pricing')return <main><h1>دسترسی مالی ندارید.</h1><p>این بخش به مجوز مستقل مالی نیاز دارد.</p></main>;if(section==='dashboard')return <FinancialDashboard initialData={await financeDashboardModel(u,new URLSearchParams(await searchParams))}/>;return <FinanceDesk key={section} section={section} initialData={section==='receipts'?await readCustomerReceipts(u):await readFinanceData(u)}/>}
