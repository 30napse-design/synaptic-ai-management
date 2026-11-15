import {passwordMinimum} from '../../../lib/org-access';
import PasswordForm from './password-form';
import WorkspaceShell from '../../../components/workspace/workspace-shell';
import {identity} from '../../../lib/staff-server';
import {localSession} from '../../../lib/staff-auth';
import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';
export default async function PasswordPage(){const minimumLength=await passwordMinimum();const u=await identity();if(u)return <WorkspaceShell user={u}><PasswordForm minimumLength={minimumLength}/></WorkspaceShell>;const a=await localSession();if(!a)redirect('/login');return <PasswordForm minimumLength={minimumLength}/>}
