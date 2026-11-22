'use client';
import {useState} from 'react';
export default function InitialOwnerSetup({onCreated}:{onCreated:()=>void}){
 const [name,setName]=useState(''),[token,setToken]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[approved,setApproved]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 if(done)return <p className="notice" role="status">حساب owner ایجاد شد. با رمز اولیه وارد شوید؛ تغییر رمز در اولین ورود اجباری است.</p>;
 return <details className="initial-owner-setup"><summary>راه‌اندازی امن مدیر اولیه</summary><p>فقط برای دیتابیس بدون حساب کاربری. کلید راه‌اندازی را از مسیر امن مدیریت میزبان دریافت کنید؛ آن را در گفتگو یا URL قرار ندهید.</p><form onSubmit={async e=>{
  e.preventDefault();setMessage('');if(password!==confirm){setMessage('تکرار رمز یکسان نیست.');return}setBusy(true);
  try{const r=await fetch('/api/auth/provision',{method:'POST',headers:{'Content-Type':'application/json','x-synapse-setup':token},body:JSON.stringify({action:'initial_owner',name,password,confirmInitialOwner:approved})}),data:any=await r.json();if(!r.ok)throw Error(data.error);setToken('');setPassword('');setConfirm('');setDone(true);onCreated()}catch(error:any){setMessage(error.message)}finally{setBusy(false)}
 }}>
  <label>نام مدیر<input required maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
  <label>کلید راه‌اندازی امن<input required type="password" dir="ltr" autoComplete="off" minLength={32} maxLength={512} value={token} onChange={e=>setToken(e.target.value)}/></label>
  <label>رمز اولیه انتخابی<input required type="password" dir="ltr" autoComplete="new-password" minLength={8} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>
  <label>تکرار رمز اولیه<input required type="password" dir="ltr" autoComplete="new-password" minLength={8} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
  <p className="hint">رمز باید حروف بزرگ، کوچک و عدد داشته باشد؛ حداقل طول مصوب سرور نیز کنترل می‌شود.</p>
  <label><input required type="checkbox" checked={approved} onChange={e=>setApproved(e.target.checked)}/>ایجاد یک‌باره حساب مدیر اصلی owner را تأیید می‌کنم.</label>
  {message&&<p className="error-banner" role="alert">{message}</p>}
  <button className="primary" disabled={busy} type="submit">{busy?'در حال ثبت…':'ایجاد مدیر اولیه'}</button>
 </form></details>;
}
