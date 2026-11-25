/** Administrative presentation-only map. Never authorize a permission from a title.
 * This inventory deliberately preserves existing account/role IDs.
 * A role that is not attached to a compatible live account stays UNASSIGNED.
 */
import {intakeResponsibleRoles,type IntakeRoleId} from './unified-intake-taxonomy.ts';
export type AccountRoleMatch={responsibility:IntakeRoleId;orgRole:string|null;status:'existing'|'needs-review'|'unassigned';note:string};
export const approvedAccountRoleMatches:AccountRoleMatch[]=[
 {responsibility:'director',orgRole:'management',status:'existing',note:'حساب مدیریت فعلی حفظ می‌شود'},
 {responsibility:'senior_research',orgRole:'executive_director',status:'needs-review',note:'عنوان اصلاح شده؛ نظارت پژوهشی و اختیارات باید مستقل تأیید شوند'},
 {responsibility:'technical_project',orgRole:'research_manager',status:'needs-review',note:'عنوان اصلاح شده؛ مسئول فنی هر پروژه باید جداگانه منصوب شود'},
 {responsibility:'scientific_project',orgRole:'scientific_manager',status:'needs-review',note:'عنوان اصلاح شده؛ مسئول علمی هر پروژه باید جداگانه منصوب شود'},
 {responsibility:'scientific_reception',orgRole:'customer_manager',status:'existing',note:'دسترسی پذیرش و پشتیبانی بر اساس مجوزهای قبلی'},
 {responsibility:'finance_manager',orgRole:'finance_manager',status:'existing',note:'اختیار مالی فعلی محفوظ است'},
 {responsibility:'accountant',orgRole:null,status:'unassigned',note:'حساب حسابداری مستقل وجود ندارد؛ حساب کارشناس پژوهش نباید بدون انتقال امن تبدیل شود'},
 {responsibility:'administrative',orgRole:'administration_manager',status:'existing',note:'حوزه محرمانه منابع انسانی فقط برای افراد مجاز'},
 {responsibility:'it_specialist',orgRole:'it_security_manager',status:'existing',note:'مدیریت دسترسی و اسرار سامانه همچنان نیازمند مجوز مدیریت است'},
];
export function approvedAccountResponsibility(role:IntakeRoleId){
 return approvedAccountRoleMatches.find(m=>m.responsibility===role)!;
}
export const approvedAccountOverview=approvedAccountRoleMatches.map(m=>({
 ...m,
 label:intakeResponsibleRoles.find(r=>r.id===m.responsibility)!.label,
}));
/** Shared navigation only, NOT global read permission. Server-side APIs still enforce per-record ACL. */
export const sharedStaffSurfaces=['داشبورد شخصی','پذیرش، ارتباط و پشتیبانی','کارتابل و برنامه‌ریزی','برد وظایف','مکاتبات داخلی'] as const;
