import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(process.env.PW_PACKAGE_JSON);
const {chromium}=require('playwright');
const port=3197,origin='http://127.0.0.1:'+port;
const packageNo=process.env.QA_PACKAGE||'03';
const fixture={user:{manager:true,email:'qa@example.test',name:'QA',username:'qa'},categories:[],members:[],items:[],sync:[],manualAssignment:false,total:12,nextOffset:5,ticketSummary:{all:12,new:4,today:2,waiting:3,overdue:3,unassigned:1},roleCounts:{all:12,director:12,senior_research:8},unifiedCounts:{},followups:{all_count:12}};
const output=process.env.QA_OUTPUT||'qa-browser-output';
await mkdir(output,{recursive:true});
await mkdir('app/qa-ticket-fixture',{recursive:true});
await writeFile('app/qa-ticket-fixture/page.tsx',`import {Suspense} from 'react';import OperationsApp from '../operations/operations-app';export default function QA(){return <Suspense><OperationsApp initialData={${JSON.stringify(fixture)}} initialFilters={{sortOrder:'asc'}}/></Suspense>}`);
const env={PATH:process.env.PATH,HOME:process.env.HOME,NODE_ENV:'development',NEXT_TELEMETRY_DISABLED:'1'};
const server=spawn('node',['node_modules/next/dist/bin/next','dev','--webpack','--hostname','127.0.0.1','--port',String(port)],{env,stdio:'inherit'});
let browser;
try{
 for(let i=0;i<120;i++){try{await fetch(origin+'/qa-ticket-fixture?view=tickets',{signal:AbortSignal.timeout(15000)});break}catch{if(i===119)throw Error('server unavailable');await new Promise(r=>setTimeout(r,1000))}}
 browser=await chromium.launch({headless:true});
 for(const [width,height] of [[1440,1000],[390,844]]){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage(),requests=[],errors=[],writes=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{
    const req=route.request(),u=new URL(req.url());
    if(u.origin!==origin)return route.abort();
    if(req.method()!=='GET'&&req.method()!=='HEAD'){writes.push(req.method()+' '+u.pathname);return route.abort()}
    if(u.pathname==='/api/operations'){
      requests.push(u.searchParams);const size=Number(u.searchParams.get('pageSize')||5),offset=Number(u.searchParams.get('offset')||0);
      const items=Array.from({length:Math.min(size,12-offset)},(_,i)=>({id:'qa-'+(offset+i),title:'QA ticket '+(offset+i),sourceType:'gmail',channel:'gmail',status:'open',isTicket:true,ticketKind:'support',requestType:'unknown',sourceBody:'Fixture only',sourceAt:'2026-10-01T12:00:00Z',attachments:[],revision:1}));
      return route.fulfill({json:{...fixture,items,nextOffset:offset+size<12?offset+size:null}});
    }
    if(u.pathname.startsWith('/api/'))return route.fulfill({json:[]});
    return route.continue();
  });
  const waitRequest=async(predicate)=>{for(let i=0;i<50;i++){if(requests.some(predicate))return;await page.waitForTimeout(100)}throw Error('Expected filter request missing')};
  const overflow=async()=>{const size=await page.evaluate(()=>({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth}));assert.ok(size.s<=size.w+3,JSON.stringify(size))};
  await page.goto(origin+'/qa-ticket-fixture?view=tickets');
  await page.locator('.ticket-dashboard-card').first().waitFor();
  await waitRequest(p=>p.get('pageSize')==='5'&&p.get('sortOrder')==='asc');
  await page.locator('.ops-item-row').first().waitFor();
  assert.equal(await page.locator('.ticket-dashboard-card').count(),6);
  assert.equal(await page.locator('.v3-source-tabs button').count(),8);
  await page.screenshot({path:output+'/tkt-'+packageNo+'-desk-'+width+'.png',fullPage:true});
  await page.locator('.v3-source-tabs button').filter({hasText:'Gmail'}).click();
  await waitRequest(p=>p.get('ticketSource')==='gmail');
  await page.locator('.ticket-card-waiting').click();
  await waitRequest(p=>p.get('status')==='waiting');
  if(width<850)await page.getByRole('button',{name:'نمایش مسئولیت‌ها'}).click();
  await page.locator('.v3-role-options button').filter({hasText:'مدیر ارشد پژوهشی'}).click();
  await waitRequest(p=>p.get('unifiedRole')==='senior_research');
  const calendar=page.locator('.v3-calendar');
  const month=await calendar.locator('header b').innerText();
  await calendar.getByRole('button',{name:'ماه بعد'}).click();
  assert.notEqual(await calendar.locator('header b').innerText(),month);
  await calendar.locator('.v3-calendar-grid button').first().click();
  await waitRequest(p=>p.get('datePreset')==='custom'&&p.get('dateFrom')===p.get('dateTo'));
  await page.locator('.v3-list-heading select').selectOption('10');
  await waitRequest(p=>p.get('pageSize')==='10');
  await page.getByRole('button',{name:'نمای پژوهشگر',exact:true}).click();
  await page.getByRole('heading',{name:'چطور می‌توانیم کمکتان کنیم؟'}).waitFor();
  const previous=requests.length;
  await page.waitForTimeout(400);
  assert.equal(requests.length,previous);
  assert.equal(await page.locator('.ops-item-row').count(),0);
  if(packageNo==='03'){
    const w=page.locator('.sw-root');
    assert.equal(await w.locator('.sw-choice').count(),10);
    await w.getByRole('button',{name:'ادامه و انتخاب موضوع'}).click();
    await w.getByRole('alert').waitFor();
    await w.locator('.sw-choice').first().click();
    await w.getByRole('button',{name:'ادامه و انتخاب موضوع'}).click();
    await w.locator('.sw-choice').first().click();
    await w.getByRole('button',{name:'ادامه و تکمیل اطلاعات درخواست'}).click();
    await w.getByRole('button',{name:'مشاهده مرحله دریافت کد پیگیری'}).click();
    await w.getByRole('alert').waitFor();
    await w.getByLabel('نام و نام خانوادگی').fill('آزمون پژوهشگر');
    await w.getByLabel('شماره موبایل').fill('۰۹۱۲۳۴۵۶۷۸۹');
    await w.getByLabel('ایمیل').fill('qa@example.test');
    await w.getByLabel('شرح درخواست').fill('اطلاعات آزمایشی');
    assert.equal(await w.getByLabel('موعد پیگیری (داخلی)').count(),0);
    await w.locator('input[type=file]').setInputFiles({name:'qa.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-test')});
    await w.getByRole('button',{name:'مشاهده مرحله دریافت کد پیگیری'}).click();
    assert.match(await w.getByRole('status').innerText(),/اطلاعاتی به سرور ارسال نشده است/);
    assert.equal(await w.getByRole('heading',{name:'درخواست با موفقیت ثبت شد'}).count(),0);
    await page.screenshot({path:output+'/tkt-03-review-'+width+'.png',fullPage:true});
    await w.getByRole('button',{name:'مرحله قبل'}).click();
    assert.equal(await w.getByLabel('شرح درخواست').inputValue(),'اطلاعات آزمایشی');
    await w.getByRole('button',{name:'حذف qa.pdf'}).click();
    assert.equal(await w.getByRole('button',{name:'حذف qa.pdf'}).count(),0);
    await overflow();
    await page.goto(origin+'/support');
    await page.locator('.sw-root .sw-choice').first().waitFor();
    assert.equal(await page.locator('.sw-choice').count(),10);
    assert.equal(await page.locator('.v3-role-sidebar').count(),0);
  }else{
    assert.equal(await page.locator('.v3-preview-category').count(),10);
    await page.screenshot({path:output+'/tkt-02-preview-'+width+'.png',fullPage:true});
  }
  assert.deepEqual(writes,[]);
  assert.deepEqual(errors,[]);
  console.log('PASS isolated browser TKT-'+packageNo+' '+width+'px');
  await context.close();
 }
}finally{await browser?.close();server.kill('SIGTERM')}
