import {unifiedIntakeCategories} from '../../lib/unified-intake-taxonomy';
import {selectCategory} from '../../lib/validations/support-wizard-validation';
import type {WizardStepProps} from '../../types/support-wizard';
export function Step1Category({data,updateData}:WizardStepProps){return <div className="sw-groups">{(['services','consultation'] as const).map(group=><section key={group} className={'sw-group '+group}><h2>{group==='services'?'خدمات و پیگیری':'مشاوره تخصصی'}</h2>{unifiedIntakeCategories.filter(c=>c.group===group).map(c=><button type="button" className="sw-choice" key={c.id} aria-pressed={data.categoryId===c.id} onClick={()=>updateData(selectCategory(data,c.id))}>{c.title}</button>)}</section>)}</div>}
