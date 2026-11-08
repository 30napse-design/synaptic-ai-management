import {redirect,notFound} from 'next/navigation';
import StaffApp from '../../staff/staff-app';
import {identity} from '../../../lib/staff-server';
import {localSession} from '../../../lib/staff-auth';
import {hasAccess,moduleKinds} from '../../../lib/auth-policy';
export const dynamic='force-dynamic';
export default async function Work({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!moduleKinds[section])notFound();const local=await localSession();if(local?.must_change)redirect('/account/password');const u=await identity();if(!u)redirect('/login');if(!hasAccess(u,section))return <main><h1>دسترسی به این بخش مجاز نیست</h1><a href="/">بازگشت به خانه سامانه</a></main>;return <StaffApp section={section}/>}
