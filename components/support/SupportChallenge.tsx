'use client';
import {useEffect,useRef,useState} from 'react';
import Script from 'next/script';

type Turnstile={
 render:(element:HTMLElement,options:{sitekey:string;action:string;callback:(token:string)=>void;'expired-callback':()=>void;'error-callback':()=>void})=>string;
 remove:(id:string)=>void;
};

export function SupportChallenge({siteKey,onToken}:{siteKey:string;onToken:(token:string)=>void}){
 const target=useRef<HTMLDivElement>(null);
 const [ready,setReady]=useState(false);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const api=(window as Window & {turnstile?:Turnstile}).turnstile;
  if(!ready||!api||!target.current)return;
  const widget=api.render(target.current,{sitekey:siteKey,action:'support_ticket',callback:onToken,
   'expired-callback':()=>onToken(''),'error-callback':()=>{onToken('');setFailed(true);}});
  return ()=>api.remove(widget);
 },[ready,siteKey,onToken]);
 return <>
  <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={()=>setReady(true)} onError={()=>setFailed(true)}/>
  <div ref={target}/>
  {failed&&<p role="alert">بارگذاری بررسی امنیتی انجام نشد. اتصال را بررسی و صفحه را دوباره باز کنید.</p>}
 </>;
}
