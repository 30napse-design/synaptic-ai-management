export const ACCOUNTANT_USERNAME = 'accountant';
export const SPECIALIST_USERNAME = 'specialist';
export const ACCOUNTANT_PERMISSIONS = Object.freeze(['finance.read','finance.create','finance.corrections.request','customer-finance.read','tickets.finance.read','tickets.finance.follow-up','bank.read','bank-statements.read','tariffs.read']);
export const ACCOUNTANT_FORBIDDEN = Object.freeze(['finance.update-existing','finance.approve','finance.void','finance.delete','bank.write','bank.reconcile','tariffs.write','accounts.manage','scientific.read','research.read','admin.read']);
export const STAFF_LOGIN_BY_TITLE = Object.freeze({'مسئول علمی پروژه':'scientific','مسئول فنی پروژه':'research','کارشناس امور اداری':'admin'});
export const INTAKE_CATEGORIES = Object.freeze([['01','خدمات و ثبت سفارش‌ها'],['02','پروژه‌های در حال اجرا'],['03','نتایج و گزارش‌ها'],['04','امور مالی مشتریان'],['05','امور داخلی و اداری'],['06','پشتیبانی فنی و فناوری اطلاعات'],['07','مشاوره تخصصی پیش از سفارش'],['08','مشاوره تخصصی اصلاح و تغییر سفارش'],['09','مشاوره تخصصی حین اجرا'],['10','مشاوره تخصصی نتایج و رفع اشکال']]);
const normalized = value => String(value ?? '').trim().toLowerCase();
export function isOwner(actor) { return Boolean(actor && actor.active !== false && (actor.owner === true || normalized(actor.role) === 'owner' || normalized(actor.username) === 'owner')); }
export function isAccountant(actor) { return Boolean(actor && actor.active !== false && normalized(actor.username) === ACCOUNTANT_USERNAME); }
export function isSpecialist(actor) { return Boolean(actor && actor.active !== false && normalized(actor.username) === SPECIALIST_USERNAME); }
export function canManageAccounts(actor) { return isOwner(actor); }
export function canDeactivate(actor, targetUsername) { return isOwner(actor) && normalized(targetUsername) !== 'owner'; }
export function canReadBank(actor) { return isOwner(actor) || isAccountant(actor); }
export function canWriteBank() { return false; }
export function canCreateFinance(actor) { return isOwner(actor) || isAccountant(actor); }
export function canEditExistingFinance() { return false; }
export function canRequestCorrection(actor) { return isOwner(actor) || isAccountant(actor); }
export function canDeleteRecord(actor, target = {}) { return isOwner(actor) && !target.issued && !target.paid && !target.statutory; }
export function validateCorrectionRequest(input) { if (!input || typeof input !== 'object') return {ok:false,error:'correction_request_required'}; const value = input; const recordId = String(value.recordId ?? '').trim(); const reason = String(value.reason ?? '').trim(); const version = Number(value.version); if (!recordId || !Number.isInteger(version) || version < 1 || !reason || reason.length < 3) return {ok:false,error:'correction_request_invalid'}; return {ok:true,value:{recordId,version,reason,proposal:value.proposal ?? null}}; }
export function isReadOnlyAction(action) { return new Set(['bank.read','bank-statements.read','tariffs.read']).has(String(action)); }
export function isKnownCategory(code) { return INTAKE_CATEGORIES.some(([id]) => id === String(code)); }
