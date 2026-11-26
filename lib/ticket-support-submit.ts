import {type WebsiteFormId} from './ticket-sources-mapping';
import {dispatchCreate} from './dispatch-engine';
import {digest} from './staff-auth';
import {type TicketEntry,ticketMetadata} from './ticket-support-policy';
import {normalizeIranPhone} from './unified-intake-routing';

export async function submitSupportTicket(user:{email:string;manager?:boolean;name?:string},entry:TicketEntry,fromPublic=false,form?:WebsiteFormId){
 const labels={...ticketMetadata(entry),...(fromPublic?{ticket_public:1}:{})};
 const dispatchEntry={
  websiteForm:form,sourceKey:(fromPublic?'public-support:':'ticket:')+entry.requestKey.toLowerCase(),
  noContentMatch:true,partyKind:'customer',direction:'inbound',
  channel:entry.source==='site'?'website':'manual',isTicket:true,ticketKind:'support',
  title:(entry.source==='direct'?entry.title.trim():entry.topic).slice(0,240),
  subtype:entry.topic,sourceBody:entry.description.trim(),clientName:entry.clientName.trim(),
  phone:normalizeIranPhone(entry.phone),email:entry.email.trim(),reference:entry.reference.trim(),
  organization:entry.organization?.trim()||'',due:entry.due,unifiedCategory:entry.category,
  unifiedTopic:entry.topic,requestType:'unknown',clientKind:'unknown',intakeState:'unreviewed'
 };
 const fingerprint=await digest(JSON.stringify(dispatchEntry));
 const result=await dispatchCreate(user,dispatchEntry,fromPublic,'',{labels,fingerprint});
 return {
  ok:true,id:result.id,trackingCode:result.id,replayed:result.replayed,
  source:labels.ticket_source,category:labels.ticket_category,topic:labels.ticket_topic,requires_attachment_review:true
 };
}
