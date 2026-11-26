'use client';
import {Monitor,UserCircle,Inbox,AlertCircle} from 'lucide-react';
import {intakeResponsibleRoles} from '../../lib/unified-intake-taxonomy';
import './ticket-dashboard.css';
import {ResearcherSupportWizard} from '../support/ResearcherSupportWizard';
export function HeaderControls({researcher,role,onView,onRole}:{researcher:boolean;role?:string;onView:(v:boolean)=>void;onRole?:(v:string)=>void}){
 return <div className="v3-header-controls" dir="rtl"><div className="v3-view-toggle"><button type="button" aria-pressed={!researcher} onClick={()=>onView(false)}><Monitor size={16}/>نمای سامانه</button><button type="button" aria-pressed={researcher} onClick={()=>onView(true)}><UserCircle size={16}/>نمای پژوهشگر</button></div>{!researcher&&onRole&&<label>نمای سازمانی<select aria-label="نمای سازمانی" value={role||''} onChange={e=>onRole(e.target.value)}><option value="">نمای مدیریت / تمام موارد مجاز</option>{intakeResponsibleRoles.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}{role==='unclassified'&&<option value="unclassified">مسئولیت نامشخص</option>}</select></label>}</div>
}
// This preview receives no staff data and contains no network or submit action.
export function ResearcherPreview({onBack}:{onBack:()=>void}){
 return <main className="ticket-v3 v3-researcher-preview" dir="rtl"><HeaderControls researcher onView={v=>{if(!v)onBack()}}/><ResearcherSupportWizard/></main>
}
export function TicketListSkeleton({size=5}:{size?:number}){return <div className="v3-skeleton" role="status" aria-label="در حال دریافت پیام‌ها">{Array.from({length:size},(_,i)=><div key={i} aria-hidden="true"><i/><i/><i/></div>)}</div>}
export function TicketError({onRetry}:{onRetry:()=>void}){return <div className="v3-state" role="alert"><AlertCircle size={28}/><h3>خطا در دریافت اطلاعات</h3><p>دریافت اطلاعات ممکن نشد؛ داده‌ای تغییر نکرده است.</p><button type="button" className="secondary" onClick={onRetry}>تلاش مجدد</button></div>}
export function TicketEmpty({onReset}:{onReset:()=>void}){return <div className="v3-state"><Inbox size={28}/><h3>هیچ پیامی یافت نشد</h3><p>برای مشاهده موارد دیگر، فیلترها را تغییر دهید.</p><button type="button" className="secondary" onClick={onReset}>پاک‌کردن فیلترها</button></div>}
