import {identity} from '../../lib/staff-server';import {redirect} from 'next/navigation';import ProfileApp from './profile-app';
export const dynamic='force-dynamic';
export default async function AccountPage(){if(!await identity())redirect('/login');return <ProfileApp/>}
