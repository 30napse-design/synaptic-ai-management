import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const roles=read('lib/org-role-catalog.ts');
const approvals=read('lib/approved-account-responsibilities.ts');
const auth=read('lib/auth-policy.ts');
const page=read('app/accounts/accounts-app.tsx');
const taxonomy=read('lib/unified-intake-taxonomy.ts');
test('nine agreed responsibility labels exist in the central taxonomy',()=>{
 for(const label of ['رئیس پژوهشکده','مدیر ارشد پژوهشی','مسئول فنی پروژه','مسئول علمی پروژه','پذیرش و پشتیبانی علمی','مدیر مالی و قراردادها','کارشناس حسابداری','امور اداری و اجرایی','کارشناس فناوری اطلاعات'])assert.ok(taxonomy.includes(label),label);
 assert.equal((approvals.match(/responsibility:'(?:director|senior_research|technical_project|scientific_project|scientific_reception|finance_manager|accountant|administrative|it_specialist)'/g)||[]).length,9);
});
test('existing account identities and permission keys were not rewritten',()=>{
 for(const id of ['executive_director','customer_manager','scientific_manager','research_manager','finance_manager','administration_manager','it_security_manager','research_specialist'])assert.ok(roles.includes(id),id);
 assert.match(approvals,/responsibility:'accountant',orgRole:null,status:'unassigned'/);
 assert.match(approvals,/status:'needs-review'/);
 assert.match(auth,/SHARED_OPERATIONS_PERMISSIONS=\['operations','calls'\]/);
});
test('common staff navigation does not bypass per-record access enforcement',()=>{
 for(const name of ['پذیرش، ارتباط و پشتیبانی','کارتابل و برنامه‌ریزی','برد وظایف','مکاتبات داخلی'])assert.ok(approvals.includes(name),name);
 assert.match(approvals,/Never authorize a permission from a title/);
 assert.match(page,/approvedAccountOverview\.map/);
 assert.match(page,/نمایش مسیر، مجوز خواندن همه رکوردها نیست/);
});

test('existing actions survive inside accessible accordion rows',()=>{
 assert.match(page,/<details className="synapse-account-row"/);
 assert.match(page,/<summary className="synapse-account-bar"/);
 assert.match(page,/managed_edit/);
 assert.match(page,/managed_reset/);
 assert.match(page,/initial_credentials/);
 assert.match(page,/password/);
 assert.match(page,/data\.organization_accounts\.filter/);
 const css=read('app/accounts/accounts-accordion.css');
 assert.match(css,/focus-visible/);
 assert.match(css,/max-width:620px/);
});
