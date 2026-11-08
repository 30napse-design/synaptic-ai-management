import StaffApp from './staff-app';
import {identity} from '../../lib/staff-server';
import {localSession} from '../../lib/staff-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function Page(){const local=await localSession();if(local?.must_change)redirect('/account/password');if(!await identity())redirect('/login');return <StaffApp/>}
