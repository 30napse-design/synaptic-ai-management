'use client';
import {useState} from 'react';
import styles from './ticket-category-selector.module.css';
import {type TicketEntrySource} from '../../lib/ticket-support-taxonomy';
import {unifiedIntakeCategories,intakeDefaultResponsibility,intakeGroupLabel,type IntakeGroupId} from '../../lib/unified-intake-taxonomy';

export type TicketCategorySelection={source:TicketEntrySource;group?:IntakeGroupId;category:string;topic:string;description:string;title:string};
type Props={value:TicketCategorySelection;onChange:(next:TicketCategorySelection)=>void;showInternal?:boolean};
export function TicketCategorySelector({value,onChange,showInternal=false}:Props){
 const [expanded,setExpanded]=useState(false);
 const category=unifiedIntakeCategories.find(c=>c.id===value.category);
 const activeGroup=value.group||category?.group||'services';
 const cats=unifiedIntakeCategories.filter(c=>c.group===activeGroup);
 const group=cats.find(x=>x.id===value.category)||cats[0];
 const responsibility=intakeDefaultResponsibility(group.id,value.topic);
 const set=(update:Partial<TicketCategorySelection>)=>onChange({...value,...update});
 return <section className={styles.root} dir="rtl" aria-label="طبقه‌بندی درخواست">
  <div className={styles.sources} role="group" aria-label="مسیر ورود">
   <button type="button" aria-pressed={value.source==='site'} className={value.source==='site'?styles.selected:''} onClick={()=>set({source:'site',group:'services',category:'service_orders',topic:'',description:'',title:''})}>تیکت‌های سایت</button>
   <button type="button" aria-pressed={value.source==='direct'} className={value.source==='direct'?styles.selected:''} onClick={()=>set({source:'direct',group:'services',category:'service_orders',topic:'',description:'',title:''})}>ثبت مستقیم سامانه</button>
  </div>
  <div className={styles.fields}>
   <label>گروه درخواست<select value={activeGroup} onChange={e=>{const group=e.target.value as IntakeGroupId;set({group,category:unifiedIntakeCategories.find(c=>c.group===group)?.id||'',topic:''})}}><option value="services">{intakeGroupLabel('services')}</option><option value="consultation">{intakeGroupLabel('consultation')}</option></select></label>
   <label>دسته اصلی<select value={group.id} onChange={e=>set({category:e.target.value,topic:''})}>{cats.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
   <label>موضوع درخواست<select value={group.topics.some(t=>t.title===value.topic)?value.topic:''} onChange={e=>set({topic:e.target.value})}><option value="">موضوع درخواست را انتخاب کنید</option>{group.topics.map(topic=><option key={topic.title} value={topic.title}>{topic.title}</option>)}</select></label>
  </div>
  <p className="hint" role="status">{responsibility?'حوزه مسئولیت پیشنهادی: '+responsibility.label+' · تعیین شخص منوط به حساب فعال و مجاز است.':'پس از انتخاب موضوع، حوزه مسئولیت پیشنهادی نمایش داده می‌شود.'}</p>
  {value.source==='direct'&&<label>عنوان پیام<input maxLength={240} value={value.title} onChange={e=>set({title:e.target.value})} placeholder="عنوان کوتاه درخواست"/></label>}
  <label>شرح درخواست (اختیاری)<textarea rows={expanded?6:3} maxLength={16000} value={value.description} onChange={e=>set({description:e.target.value})} placeholder="در صورت نیاز، جزئیات درخواست خود را بنویسید…"/></label>
  <button type="button" className="secondary" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'توضیح کوتاه‌تر':'فضای بیشتر برای توضیحات'}</button>
 </section>;
}
