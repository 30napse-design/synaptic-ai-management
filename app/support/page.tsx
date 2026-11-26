import {ResearcherSupportWizard} from '../../components/support/ResearcherSupportWizard';
import {publicSupportSiteKey} from '../../lib/public-support';

import {isWebsiteFormId} from '../../lib/ticket-sources-mapping';

export const dynamic='force-dynamic';

export default async function SupportPage({searchParams}:{searchParams:Promise<{form?:string}>}){
 const {form}=await searchParams;
 return <main dir="rtl"><ResearcherSupportWizard publicSiteKey={publicSupportSiteKey()} form={isWebsiteFormId(form)?form:undefined}/></main>;
}
