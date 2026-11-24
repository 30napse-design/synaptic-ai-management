import {type TicketEntrySource} from './ticket-support-taxonomy.ts';
import {intakeDefaultResponsibility,intakeCategory} from './unified-intake-taxonomy.ts';
import {validOptionalEmail,validPersianContactName,normalizeIranPhone} from './unified-intake-routing.ts';

/** Historical ticket_v:1 rows remain readable. New staff-submitted tickets use v2. */
export const TICKET_CATALOG_VERSION=2;
export type TicketEntry={source:TicketEntrySource;group:string;category:string;topic:string;description:string;title:string;clientName:string;phone:string;email:string;reference:string;due:string;requestKey:string;organization?:string};
export function validTicketEntry(b:any,manager=false):b is TicketEntry{
 if(!b||!['site','direct'].includes(b.source)||typeof b.category!=='string'||typeof b.topic!=='string')return false;
 const route=intakeDefaultResponsibility(b.category,b.topic);
 if(!route||route.group!==(b.group||intakeCategory(b.category)?.group))return false;
 if(typeof b.description!=='string'||b.description.length>16000||typeof b.title!=='string'||b.title.length>240)return false;
 if(b.source==='direct'&&!b.title.trim())return false;
 for(const [key,max] of [['clientName',160],['phone',80],['email',200],['reference',160],['organization',240],['due',10]] as const)
  if(typeof b[key]!=='string'||b[key].length>max)return false;
 if(!validPersianContactName(b.clientName)||!validOptionalEmail(b.email))return false;
 if(!b.email.trim()&&!normalizeIranPhone(b.phone))return false;
 if(b.phone&&!normalizeIranPhone(b.phone))return false;
 if(b.due&&!/^\d{4}-\d{2}-\d{2}$/.test(b.due))return false;
 return true;
}
export function ticketMetadata(b:TicketEntry){
 const route=intakeDefaultResponsibility(b.category,b.topic)!;
 return {ticket_v:TICKET_CATALOG_VERSION,ticket_source:b.source,ticket_group:route.group,ticket_category:b.category,ticket_category_label:route.categoryLabel,ticket_topic:b.topic,ticket_role:route.role,ticket_topic_key:b.source+':'+b.category+':'+b.topic};
}
export const ticketSourceLabels=['site','direct'] as const;
