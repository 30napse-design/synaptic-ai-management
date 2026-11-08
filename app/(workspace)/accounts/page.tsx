import AccountsApp from '../../accounts/accounts-app';
import {workspaceUser} from '../../../lib/workspace-user';
export default async function AccountsPage(){const u=await workspaceUser();if(!u.manager)return <main><h1>مدیریت حساب‌ها مخصوص مدیر سامانه است.</h1></main>;return <AccountsApp/>}
