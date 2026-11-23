'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {Camera,CheckCircle2,ChevronRight,Loader2,Save,ShieldCheck,UserRound} from 'lucide-react';
import UserAvatar from '../../components/workspace/user-avatar';
import {accountRoleEnglish} from '../../components/workspace/account-menu';
import './profile-app.css';

type Profile={displayName:string;phone:string;contactEmail:string;department:string;jobTitle:string;bio:string};
const empty:Profile={displayName:'',phone:'',contactEmail:'',department:'',jobTitle:'',bio:''};
async function resultJson(response:Response){
 const raw=await response.text();
 try{return JSON.parse(raw)}catch{throw Error('پاسخ سرور نامعتبر است (HTTP '+response.status+'). لطفاً وضعیت سرویس را بررسی کنید.')}
}
export default function ProfileApp(){
 const router=useRouter();
 const [data,setData]=useState<any>(null),[form,setForm]=useState<Profile>(empty);
 const [avatarVersion,setAvatarVersion]=useState(''),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false);
 const [error,setError]=useState(''),[message,setMessage]=useState('');
 useEffect(()=>{let active=true;fetch('/api/profile',{cache:'no-store'}).then(async r=>{const d=await resultJson(r);if(!r.ok)throw Error(d.error||'خطای دریافت حساب');return d}).then(d=>{if(!active)return;setData(d);const p=d.profile||{};setForm({displayName:p.display_name||d.user?.name||'',phone:p.phone||'',contactEmail:p.contact_email||'',department:p.department||'',jobTitle:p.job_title||'',bio:p.bio||''})}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 const change=(key:keyof Profile,value:string)=>setForm(prev=>({...prev,[key]:value}));
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||uploading)return;setBusy(true);setError('');setMessage('');
  try{const response=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const d=await resultJson(response);if(!response.ok)throw Error(d.error||'ذخیره ناموفق بود');setMessage('تغییرات حساب ذخیره شد.');window.dispatchEvent(new Event('synapse-profile-updated'));router.refresh()}
  catch(e:any){setError(e.message||'خطای ذخیره')}finally{setBusy(false)}
 }
 async function upload(file?:File){
  if(!file)return;
  setMessage('');setError('');
  if(!['image/png','image/jpeg'].includes(file.type)||file.size>2*1024*1024||file.size===0){setError('فقط تصویر PNG یا JPEG تا ۲ مگابایت پذیرفته می‌شود.');return}
  setUploading(true);
  try{const body=new FormData();body.set('file',file);const response=await fetch('/api/profile/avatar',{method:'POST',body});const d=await resultJson(response);if(!response.ok)throw Error(d.error||'بارگذاری انجام نشد');setAvatarVersion(String(Date.now()));setMessage('تصویر حساب ذخیره شد.');window.dispatchEvent(new Event('synapse-profile-updated'));router.refresh()}
  catch(e:any){setError(e.message||'بارگذاری تصویر انجام نشد')}finally{setUploading(false)}
 }
 if(!data)return <main className="synapse-profile-page" dir="rtl"><div className="profile-loading" role="status">{error||'در حال دریافت اطلاعات حساب…'}</div></main>;
 return <main className="synapse-profile-page" dir="rtl">
  <div className="profile-topline"><a href="/" className="profile-back"><ChevronRight size={16}/> بازگشت به سامانه</a><span className="profile-top-label">SYNAPSE / ACCOUNT</span></div>
  <header className="profile-heading"><h1>تنظیمات حساب</h1><p>تصویر، نام و اطلاعات تماس خود را از اینجا مدیریت کنید.</p></header>
  <div className="profile-layout">
   <aside className="profile-card profile-identity">
    <div className="profile-avatar-wrap"><UserAvatar name={form.displayName||data.user.name} version={avatarVersion}/></div>
    <h2>{form.displayName||data.user.name}</h2>
    <p className="profile-role" lang="en" dir="ltr">{accountRoleEnglish(data.user)}</p>
    <label className="profile-upload" aria-label="انتخاب تصویر حساب">
     {uploading?<Loader2 size={17}/>:<Camera size={17}/>}
     {uploading?'در حال بارگذاری…':'انتخاب یا تغییر عکس'}
     <input type="file" aria-label="انتخاب تصویر پروفایل" accept="image/png,image/jpeg,.jpg,.jpeg,.png" disabled={uploading||busy} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';void upload(file)}}/>
    </label>
    <small>PNG یا JPG — حداکثر ۲ مگابایت</small>
    <div className="profile-identity-divider"/>
    <div className="profile-email"><UserRound size={15}/><span dir="ltr">{data.user.email}</span></div>
    <p className="profile-permissions-note"><ShieldCheck size={15}/> سطح دسترسی فقط توسط مدیریت تعیین می‌شود.</p>
    {data.user.local&&<a href="/account/password" className="profile-password">تغییر رمز عبور</a>}
   </aside>
   <section className="profile-card profile-fields">
    <h2>مشخصات فردی</h2>
    <form onSubmit={save}>
     <div className="profile-form-grid">
      <label>نام و نام خانوادگی فارسی<input value={form.displayName} required maxLength={100} onChange={e=>change('displayName',e.target.value)} placeholder="نام کامل شما"/></label>
      <label>شماره تماس<input dir="ltr" value={form.phone} maxLength={40} onChange={e=>change('phone',e.target.value)} placeholder="شماره تماس"/></label>
      <label>ایمیل ارتباطی<input dir="ltr" type="email" value={form.contactEmail} maxLength={200} onChange={e=>change('contactEmail',e.target.value)} placeholder="name@example.com"/></label>
      <label>واحد سازمانی<input value={form.department} maxLength={100} onChange={e=>change('department',e.target.value)} placeholder="اختیاری"/></label>
     </div>
     <details className="profile-extra"><summary>اطلاعات تکمیلی (اختیاری)</summary>
      <label>عنوان حرفه‌ای<input value={form.jobTitle} maxLength={100} onChange={e=>change('jobTitle',e.target.value)}/></label>
      <label>معرفی کوتاه<textarea value={form.bio} rows={3} maxLength={1000} onChange={e=>change('bio',e.target.value)}/></label>
     </details>
     {error&&<p className="profile-alert" role="alert">{error}</p>}
     {message&&<p className="profile-success" role="status"><CheckCircle2 size={17}/>{message}</p>}
     <div className="profile-actions"><button className="profile-save" type="submit" disabled={busy||uploading}><Save size={17}/>{busy?'در حال ذخیره…':'ذخیره تغییرات'}</button></div>
    </form>
   </section>
  </div>
 </main>;
}