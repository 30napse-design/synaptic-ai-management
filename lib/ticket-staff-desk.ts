/** Staff-only ticket filter metadata. Never change historic ticket rows. */
import {siteTicketCategories} from './ticket-support-taxonomy';
export const ticketStaffCategories=siteTicketCategories;
export const legacyTicketCategories:Record<string,string>={
 orders:'customers',invoices:'billing',payments:'billing',results:'results',
 projects:'projects',internal:'internal',system:'system'
};
export function legacyTicketGroup(id:string){return legacyTicketCategories[id]||'';}
export function ticketTopicAllowed(id:string,topic:string){
 const entry=ticketStaffCategories.find(c=>c.id===id);
 return !!entry&&entry.topics.some(t=>t===topic);
}
export function memberPositionLabel(member:{manager?:boolean;username?:string;name?:string},roleCatalog:{role_key:string;title_fa:string}[],code:(username:string)=>string|undefined){
 if(member.manager)return 'مدیریت پژوهشکده';
 const role=code(member.username||'');
 return roleCatalog.find(r=>r.role_key===role)?.title_fa||member.name||'حساب بدون سمت مشخص';
}
