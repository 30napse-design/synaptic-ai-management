'use client';
import {useState} from 'react';
import {TicketCategorySelector,type TicketCategorySelection} from './ticket-category-selector';
import styles from './ticket-category-selector.module.css';
type Props={manager:boolean;onSaved:()=>void;onCancel:()=>void;inline?:boolean};
const empty:TicketCategorySelection={source:'site',group:'services',category:'service_orders',topic:'',description:'',title:''};
export function TicketSupportCreate({manager,onSaved,onCancel,inline=false}:Props){
 const [requestKey,setRequestKey]=useState(()=>crypto.randomUUID()),[uploaded,setUploaded]=useState<string[]>([]);const [value,setValue]=useState<TicketCategorySelection>(empty),[clientName,setName]=useState(''),[phone,setPhone]=useState(''),[email,setEmail]=useState(''),[reference,setReference]=useState(''),[organization,setOrganization]=useState(''),[due,setDue]=useState('');
 const [files,setFiles]=useState<File[]>([]),[createdId,setCreatedId]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy||done)return;setBusy(true);setMessage('');
  let id=createdId;
  try{
   if(!id){
    const r=await fetch('/api/ticket-support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...value,clientName,phone,email,reference,organization,due,requestKey})});
    const d:any=await r.json();if(!r.ok)throw Error(d.error||'تیکت ثبت نشد');
    id=d.id;setCreatedId(id);
   }
   for(const file of files){
    const identity=file.name+':'+file.size+':'+file.lastModified;
    if(uploaded.includes(identity))continue;
    const body=new FormData();body.set('ticket_id',id);body.set('file',file);
    const response=await fetch('/api/ticket-support/files',{method:'POST',body});
    const data:any=await response.json();
    if(!response.ok)throw Error('تیکت '+id+' ثبت شد، اما پیوست «'+file.name+'» ذخیره نشد: '+(data.error||'خطا'));
    setUploaded(prev=>[...prev,identity]);
   }
   setDone(true);setMessage('تیکت با شناسه '+id+' ثبت شد و برای ارجاع و پیگیری در موتور مشترک قرار گرفت.'+(files.length?' پیوست‌ها برای بررسی امنیتی ذخیره شدند.':''));
   onSaved();setRequestKey(crypto.randomUUID());setCreatedId('');setUploaded([]);setValue(empty);setName('');setPhone('');setEmail('');setReference('');setOrganization('');setDue('');setFiles([]);setDone(false);
  }catch(err:any){setMessage(err.message||'خطای ثبت');}finally{setBusy(false)}
 }
 return <form className={styles.createForm} onSubmit={submit} dir="rtl">
  <p className="hint">تیکت‌های سایت: ثبت دستی پیام دریافتی از وب‌سایت توسط کارکنان. ثبت عمومی وب‌سایت تا اتصال جداگانه فعال نیست. سوابق قبلی Gmail در فهرست حفظ می‌شوند.</p>
  <TicketCategorySelector value={value} onChange={v=>{if(!createdId)setValue(v)}} showInternal={manager}/>
  <div className={styles.contactFields}>
   <label>نام محقق / مشتری<input required maxLength={160} value={clientName} disabled={!!createdId} onChange={e=>setName(e.target.value)}/></label>
   <label>ایمیل تماس<input dir="ltr" type="email" maxLength={200} value={email} disabled={!!createdId} onChange={e=>setEmail(e.target.value)}/></label>
   <label>شماره تماس<input dir="ltr" type="tel" maxLength={80} value={phone} disabled={!!createdId} onChange={e=>setPhone(e.target.value)}/></label>
   <label>فاکتور / شماره مرجع (برای پیگیری؛ بدون تأیید خودکار)<input maxLength={160} value={reference} disabled={!!createdId} onChange={e=>setReference(e.target.value)}/></label>
   <label>دانشگاه / سازمان<input maxLength={240} value={organization} disabled={!!createdId} onChange={e=>setOrganization(e.target.value)}/></label>
   <label>موعد پیشنهادی پیگیری<input type="date" value={due} disabled={!!createdId} onChange={e=>setDue(e.target.value)}/></label>
  </div>
  <label>پیوست‌های درخواست (اختیاری، حداکثر ۵ فایل، هر کدام ۸ مگابایت)
   <input type="file" multiple accept=".pdf,.docx,.png,.jpg,.jpeg" disabled={busy||!!createdId} onChange={e=>{const files=Array.from(e.target.files||[]);if(files.length>5||files.some(f=>f.size>8*1024*1024)){setMessage('حداکثر ۵ فایل، هر فایل تا ۸ مگابایت');return}setMessage('');setFiles(files)}}/>
  </label>
  {files.length>0&&<small>{files.map(f=>f.name).join('، ')}</small>}
  <p className="hint">پیوست‌ها خصوصی ذخیره می‌شوند و تا بررسی امنیتی قابل مشاهده عمومی نیستند. اگر فضای فایل Hostinger فعال نباشد، سامانه خطا را صریح اعلام می‌کند.</p>
  {message&&<p role="status" className={styles.statusText}>{message}</p>}
  <div className={styles.actions}>
   <button type="submit" className="primary" disabled={busy||done||!value.topic||!clientName||(!email&&!phone)||value.source==='direct'&&!value.title.trim()}>{busy?'در حال ثبت…':createdId?'تلاش مجدد برای پیوست‌ها':'ثبت و ارجاع تیکت'}</button>
   {!inline&&<button type="button" className="secondary" disabled={busy} onClick={onCancel}>بستن</button>}
  </div>
 </form>;
}
