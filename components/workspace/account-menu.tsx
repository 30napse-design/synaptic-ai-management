'use client';
import {useState} from 'react';
import {orgRoleCatalog} from '../../lib/org-role-catalog';
export const accountRoleLabel=(user:any)=>user.manager?'مدیر پژوهشکده':(user.orgRoles||[]).map((k:string)=>orgRoleCatalog.find(r=>r.role_key===k)?.title_fa).filter(Boolean).join('، ')||(user.role==='reviewer'?'کارشناس و تأییدکننده':'همکار پژوهشکده');
import UserAvatar from './user-avatar';
export async function endSession(user:any){const r=await fetch('/api/auth/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('خروج انجام نشد؛ دوباره تلاش کنید.');const d:any=await r.json();location.assign(d.next==='/signout-with-chatgpt?return_to=%2Flogin'?d.next:'/login')}
export default function AccountMenu({user}:{user:any}){const [error,setError]=useState('');return <details className="account-menu"><summary className="home-toolbar-profile"><UserAvatar name={user.name}/><span><b>{user.name}</b><small>{accountRoleLabel(user)}</small></span></summary><div className="home-toolbar-popover"><a href="/account">تنظیمات حساب من</a>{user.local&&<a href="/account/password">تغییر رمز ورود</a>}<button onClick={()=>void endSession(user).catch(e=>setError(e.message))}>تعویض حساب کاربری</button><button onClick={()=>void endSession(user).catch(e=>setError(e.message))}>خروج امن</button>{error&&<p role="alert">{error}</p>}</div></details>}
