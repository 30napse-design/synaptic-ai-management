import {identity} from '../../lib/staff-server';import {redirect} from 'next/navigation';import {hasAccess} from '../../lib/auth-policy';import OperationsApp from './operations-app';
export const dynamic='force-dynamic';
export default async function OperationsPage(){const u=await identity();if(!u)redirect('/login');if(!u.manager&&!['operations','calls','billing_ops','results_ops'].some(s=>hasAccess(u,s)))return <main><h1>دسترسی به کارتابل مشترک مجاز نیست</h1><a href="/">بازگشت به خانه سامانه</a></main>;return <OperationsApp/>}
