'use client';
import {useState} from 'react';
import {canPreviewFile} from '../../lib/file-preview';
export default function WorkFilePreview({file}:{file:any}){
 const [open,setOpen]=useState(false),[failed,setFailed]=useState(false);
 const url='/api/work/files?id='+encodeURIComponent(file.id);
 return <div className="work-file-preview"><a href={url}>{file.file_name} ({Number(file.size).toLocaleString('fa-IR')} بایت) · دریافت فایل</a>{canPreviewFile(file.mime)?<details onToggle={e=>setOpen(e.currentTarget.open)}><summary>پیش‌نمایش {file.file_name}</summary>{open&&!failed&&(file.mime==='application/pdf'?<iframe title={'پیش‌نمایش '+file.file_name} sandbox="" src={url+'&preview=1'}/>:<img loading="lazy" alt={file.file_name} src={url+'&preview=1'} onError={()=>setFailed(true)}/>)}{failed&&<p role="status">پیش‌نمایش در دسترس نیست؛ از لینک دریافت فایل استفاده کنید.</p>}</details>:<small>برای این نوع فایل، دریافت اصل فایل در دسترس است.</small>}</div>;
}
