import {getTicketCategories,hasTicketTopic,type TicketEntrySource} from './ticket-support-taxonomy.ts';

/** New ticket keys never overwrite the legacy ops_items category/subtype. */
export const TICKET_CATALOG_VERSION=1;
export type TicketEntry={source:TicketEntrySource;category:string;topic:string;description:string;title:string;clientName:string;phone:string;email:string;reference:string;due:string;organization?:string};
export function validTicketEntry(b:any,manager=false):b is TicketEntry{
 if(!b||!['site','direct'].includes(b.source)||typeof b.category!=='string'||typeof b.topic!=='string')return false;
 if(!hasTicketTopic(b.source,b.category,b.topic))return false;
 // Internal staff matters are never exposed as public website intake topics.
 if(b.source==='site'&&b.category==='internal'&&(b.topic==='امور کارکنان'||!manager))return false;
 if(typeof b.description!=='string'||b.description.length>16000||typeof b.title!=='string'||b.title.length>240)return false;
 if(b.source==='direct'&&!b.title.trim())return false;
 for(const [key,max] of [['clientName',160],['phone',80],['email',200],['reference',160],['organization',240],['due',10]] as const)if(typeof b[key]!=='string'||b[key].length>max)return false;
 if(!b.clientName.trim()||!b.email.trim()&&!b.phone.trim())return false;
 if(b.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return false;
 if(b.due&&!/^\d{4}-\d{2}-\d{2}$/.test(b.due))return false;
 return true;
}
export function ticketMetadata(b:TicketEntry){
 const c=getTicketCategories(b.source).find(x=>x.id===b.category)!;
 return {ticket_v:TICKET_CATALOG_VERSION,ticket_source:b.source,ticket_category:b.category,ticket_category_label:c.title,ticket_topic:b.topic,ticket_topic_key:b.source+':'+b.category+':'+b.topic};
}
export const ticketSourceLabels=['site','direct'] as const;
