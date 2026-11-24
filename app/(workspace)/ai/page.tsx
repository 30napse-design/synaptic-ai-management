import SynapseAICenter from '../../../components/workspace/synapse-ai-center';
import {workspaceUser} from '../../../lib/workspace-user';
export const dynamic='force-dynamic';
export default async function AIPage(){await workspaceUser();return <SynapseAICenter/>}
