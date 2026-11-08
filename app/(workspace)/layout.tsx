import WorkspaceShell from '../../components/workspace/workspace-shell';
import {workspaceUser} from '../../lib/workspace-user';
export const dynamic='force-dynamic';
export default async function Layout({children}:{children:React.ReactNode}){const user=await workspaceUser();return <WorkspaceShell user={user}>{children}</WorkspaceShell>}
