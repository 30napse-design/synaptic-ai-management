import {identity} from '../../lib/staff-server';
import {redirect} from 'next/navigation';
import AccountsApp from './accounts-app';
export const dynamic='force-dynamic';
export default async function AccountsPage(){const u=await identity();if(!u?.manager)redirect('/login');return <AccountsApp/>}
