'use client';
import {useState} from 'react';
import {getTicketCategories,hasTicketTopic,type TicketEntrySource} from '../../lib/ticket-support-taxonomy';

export type TicketCategorySelection={source:TicketEntrySource;category:string;topic:string;description:string;title:string};
type Props={value:TicketCategorySelection;onChange:(next:TicketCategorySelection)=>void;showInternal?:boolean};
export function TicketCategorySelector({value,onChange,showInternal=false}:Props){
 const [expanded,setExpanded]=useState(false);
 const cats=getTicketCategories(value.source).filter(c=>showInternal||c.id!=='internal');
 const group=cats.find(x=>x.id===value.category)||cats[0];
 const set=(update:Partial<TicketCategorySelection>)=>onChange({...value,...update});
 return <section className="ops-ticket-taxonomy" dir="rtl" aria-label="طبقه‌بندی درخواست">
  <div className="ops-ticket-entry-modes" role="group" aria-label="مسیر ورود">
   <button type="button" aria-pressed={value.source==='site'} className={value.source==='site'?'selected':''} onClick={()=>set({source:'site',category:'orders',topic:'',description:'',title:''})}>تیکت‌های سایت</button>
   <button type="button" aria-pressed={value.source==='direct'} className={value.source==='direct'?'selected':''} onClick={()=>set({source:'direct',category:'collaboration',topic:'',description:'',title:''})}>ثبت مستقیم سامانه</button>
  </div>
  <div className="ops-ticket-two-fields">
   <label>دسته اصلی<select value={group.id} onChange={e=>set({category:e.target.value,topic:''})}>{cats.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
   <label>موضوع درخواست<select value={hasTicketTopic(value.source,group.id,value.topic)?value.topic:''} onChange={e=>set({topic:e.target.value})}><option value="">موضوع درخواست را انتخاب کنید</option>{group.topics.map(topic=><option key={topic} value={topic}>{topic}</option>)}</select></label>
  </div>
  {value.source==='direct'&&<label>عنوان پیام<input maxLength={240} value={value.title} onChange={e=>set({title:e.target.value})} placeholder="عنوان کوتاه درخواست"/></label>}
  <label>شرح درخواست (اختیاری)<textarea rows={expanded?6:3} maxLength={16000} value={value.description} onChange={e=>set({description:e.target.value})} placeholder="در صورت نیاز، جزئیات درخواست خود را بنویسید…"/></label>
  <button type="button" className="secondary" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'توضیح کوتاه‌تر':'فضای بیشتر برای توضیحات'}</button>
 </section>;
}
