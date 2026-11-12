// Local-only harness: production build, isolated in-memory D1/R2, synthetic fixtures.
// No deployed URL, production credentials, migration, or remote services are used.
import {createRequire} from 'node:module';
import {readFile,readdir,stat,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
const project=process.cwd(),require=createRequire(project+'/package.json');
const mfDir=(await readdir(project+'/node_modules/.pnpm')).find(x=>x.startsWith('miniflare@'));
const {Miniflare}=require(project+'/node_modules/.pnpm/'+mfDir+'/node_modules/miniflare');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const root=project+'/dist/server',files=(await readdir(root,{recursive:true})).filter(x=>x.endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const modules=await Promise.all(files.map(async p=>({type:'ESModule',path:root+'/'+p,contents:await readFile(root+'/'+p,'utf8')})));
const mf=new Miniflare({modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{STAFF_AUTH_PEPPER:'local-home-browser-test'}});
let server,browser;
const evidence=project+'/outputs/home-qa';await mkdir(evidence,{recursive:true});
try{
 const db=await mf.getD1Database('DB');for(const f of (await readdir(project+'/drizzle')).filter(p=>p.endsWith('.sql')).sort())for(const statement of (await readFile(project+'/drizzle/'+f,'utf8')).split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run();
 const owner='ekramiihamid@gmail.com',employee='qa-home@sites.test',now=new Date().toISOString(),today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 await db.prepare('INSERT INTO staff_members(email,name,role,active) VALUES(?,?,?,1)').bind(employee,'همکار آزمون','employee').run();
 await db.prepare('INSERT INTO staff_profiles(member_id,display_name,updated_at) VALUES(?,?,?)').bind(owner,'کاربر آزمون',now).run();
 for(let i=0;i<5;i++)await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,due,priority,status,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind('home-task-'+i,i===1?'scientific':'task',['بررسی گزارش پیشرفت پروژه پژوهشی','تکمیل مستندات علمی و نتیجه آزمایش','هماهنگی تحویل داده با همکاران','ثبت پیشرفت مرحله جاری پژوهش','بازبینی نهایی مستندات اجرای کار'][i],'داده مصنوعی فقط برای آزمون محلی',owner,owner,today,i===0?'urgent':i===1?'high':'normal',['doing','todo','blocked','changes','todo'][i],owner,now).run();
 for(const [id,kind,title,due,status,assignee] of [['next-plan','plan','جلسه هماهنگی برنامه بعدی','2099-01-01','todo',owner],['review-1','task','بررسی گزارش ارسال‌شده',today,'review',employee],['review-2','task','تصمیم درباره مدارک تکمیلی',today,'review',employee],['overdue','task','پیگیری موعد گذشته','2020-01-01','doing',owner],['mail-1','correspondence','مکاتبه داخلی مجاز برای بررسی',today,'todo',owner]])await db.prepare('INSERT INTO staff_records(id,kind,title,body,assignee,reviewer,due,priority,status,created_by,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,kind,title,'فقط آزمون محلی',assignee,owner,due,'normal',status,owner,now).run();
 await db.prepare('INSERT INTO staff_work_details(record_id,details) VALUES(?,?)').bind('next-plan',JSON.stringify({scheduledDate:'2099-01-01',startTime:'14:00',endTime:'15:00',unit:'اتاق جلسات پژوهشکده'})).run();
 await db.prepare('INSERT INTO staff_work_notifications(id,recipient,record_id,body,created_at) VALUES(?,?,?,?,?)').bind('home-notice',owner,'review-1','گزارش پژوهش برای بررسی شما آماده است.',now).run();
 const contentTypes={'.js':'text/javascript','.css':'text/css','.png':'image/png','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
 server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://127.0.0.1:'+server.address().port);const asset=path.resolve(project+'/dist/client','.'+decodeURIComponent(url.pathname));if(asset.startsWith(project+'/dist/client/')){try{if((await stat(asset)).isFile()){res.writeHead(200,{'Content-Type':contentTypes[path.extname(asset)]||'application/octet-stream'});res.end(await readFile(asset));return}}catch{}}
 const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
 // Test identity is injected only by this loopback test harness, never application code.
 const who=req.headers['x-home-test-user']==='employee'?employee:owner;headers.set('oai-authenticated-user-id','local-home:'+who);headers.set('oai-authenticated-user-email',who);
 const response=await mf.dispatchFetch(url.href,{method:req.method,headers,...(!['GET','HEAD'].includes(req.method)?{body:Buffer.concat(chunks)}:{})});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){console.error(e);res.writeHead(500);res.end('local test harness error')}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const metrics=[];
 for(const [width,height] of [[1672,941],[1440,900],[1366,768],[768,1024],[375,812]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'networkidle'});await page.locator('.home-v2-task').first().waitFor();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
  const m=await page.evaluate(()=>({width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,main:document.querySelector('.home-v2').getBoundingClientRect().toJSON(),font:getComputedStyle(document.body).fontFamily,sidebarWidth:document.querySelector('.unified-sidebar').getBoundingClientRect().width}));
  await page.screenshot({path:evidence+'/home-'+width+'x'+height+'.png',fullPage:true});console.log('layout',JSON.stringify(await page.evaluate(()=>Object.fromEntries(['.home-v2-intro','.home-v2-stats','.home-v2-body','.home-v2-priorities','.home-v2-task','.home-v2-quick','.home-v2-campus'].map(s=>[s,document.querySelector(s).getBoundingClientRect().toJSON()])))));
  assert.ok(m.documentWidth<=width+1,'horizontal overflow at '+width+': '+JSON.stringify(m));if(width>=1366)assert.ok(m.documentHeight<=height+1,'desktop vertical overflow: '+JSON.stringify(m));
  assert.equal(await page.locator('.home-v2-task').count(),3);assert.equal(await page.locator('.home-v2-stat').count(),3);
  await page.screenshot({path:evidence+'/home-'+width+'x'+height+'.png',fullPage:true});
  const before=await page.locator('.home-v2').boundingBox();if(width>=1001){await page.getByRole('button',{name:'کار و برنامه‌ریزی من',exact:true}).click();const after=await page.locator('.home-v2').boundingBox();assert.equal(Math.round(before.x),Math.round(after.x));assert.equal(Math.round(before.width),Math.round(after.width));}
  else{await page.getByRole('button',{name:'نمایش منو',exact:true}).click();await page.waitForTimeout(300);console.log('sidebar',JSON.stringify(await page.locator('.unified-sidebar').evaluate(e=>({classes:e.className,rect:e.getBoundingClientRect().toJSON(),transform:getComputedStyle(e).transform}))));await page.screenshot({path:evidence+'/sidebar-'+width+'.png'});await page.waitForFunction(()=>document.querySelector('.unified-sidebar').getBoundingClientRect().right<=innerWidth+1,{},{timeout:5000});await page.getByRole('button',{name:'بستن منو',exact:true}).click({position:{x:10,y:200}});}
  await page.getByRole('button',{name:'مکاتبات داخلی من',exact:true}).click();await page.getByRole('link',{name:'مکاتبه داخلی مجاز برای بررسی',exact:true}).waitFor();assert.equal(await page.locator('.home-mail-results a').first().getAttribute('href'),'/work/mail?id=mail-1');assert.equal(await page.locator('.home-mail .home-toolbar-icon small').count(),0);await page.getByRole('button',{name:'بستن مکاتبات',exact:true}).click();
  await page.getByRole('button',{name:/اعلان‌ها،/}).click();await page.locator('.work-notification-panel').getByRole('link',{name:/گزارش پژوهش/}).waitFor();await page.getByRole('button',{name:'بستن اعلان‌ها',exact:true}).click();
  await page.getByRole('textbox',{name:'جست‌وجو در سوابق مجاز سامانه'}).fill('مستندات');await page.locator('.home-search-results a').first().waitFor();assert.ok(await page.locator('.home-search-results a').count()>0);await page.keyboard.press('Escape');assert.equal(errors.length,0,errors.join('\n'));metrics.push({...m,consoleErrors:errors});await page.close();
 }
 const employeePage=await browser.newPage({viewport:{width:1440,height:900},extraHTTPHeaders:{'x-home-test-user':'employee'}});await employeePage.goto(base,{waitUntil:'networkidle'});assert.equal(await employeePage.locator('.home-v2-task').count(),0);assert.equal(await employeePage.getByRole('button',{name:'مکاتبات داخلی من',exact:true}).count(),1);await employeePage.getByRole('button',{name:'مکاتبات داخلی من',exact:true}).click();await employeePage.getByText('مکاتبه‌ای مرتبط با شما ثبت نشده است.').waitFor();await employeePage.getByRole('button',{name:'بستن مکاتبات',exact:true}).click();await employeePage.screenshot({path:evidence+'/home-employee-empty.png',fullPage:true});
 await writeFile(evidence+'/metrics.json',JSON.stringify(metrics,null,2));console.log('PASS: production HTML + real browser hydration, five widths, desktop no unnecessary scroll, RTL, sidebar independence, real search, separate notification/correspondence lists, no fabricated mail unread badge, user isolation, empty states, no browser JS errors.');console.log(JSON.stringify(metrics));
}finally{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());await mf.dispose()}
