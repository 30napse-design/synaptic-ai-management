import LoginForm from './login-form';
import {standaloneOwnerSetupAvailable} from '../../lib/standalone-owner-setup';
import {safeAuthReturnPath} from '../../lib/auth-redirect';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<Record<string,string>>}){
 const standalone=process.env.SYNAPSE_STANDALONE_BUILD==='1';
 let setupAvailable=false;if(standalone)try{setupAvailable=await standaloneOwnerSetupAvailable()}catch{}
 return <LoginForm standalone={standalone} setupAvailable={setupAvailable} returnTo={safeAuthReturnPath((await searchParams).return_to)}/>;
}
