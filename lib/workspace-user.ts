import {cache} from 'react';
import {redirect} from 'next/navigation';
import {identity} from './staff-server';
import {localSession} from './staff-auth';
export const workspaceUser=cache(async()=>{const a=await localSession();if(a?.must_change)redirect('/account/password');const user=await identity();if(!user)redirect('/login');return user});
