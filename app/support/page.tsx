import {ResearcherSupportWizard} from '../../components/support/ResearcherSupportWizard';
import {publicSupportSiteKey} from '../../lib/public-support';

export const dynamic='force-dynamic';

export default function SupportPage(){
 return <main dir="rtl"><ResearcherSupportWizard publicSiteKey={publicSupportSiteKey()}/></main>;
}
