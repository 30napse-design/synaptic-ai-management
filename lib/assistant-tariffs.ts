// Suggestions and quotation selection share the existing approved tariff bank.
import {approvedTariffServices} from './tariff-bank';
export function tariffSuggestions(question:string){const terms=question.toLocaleLowerCase('fa').split(/\s+/).filter(x=>x.length>2);if(!terms.length)return [];return approvedTariffServices().map(rate=>({...rate,score:terms.reduce((n,t)=>n+(rate.description.toLocaleLowerCase('fa').includes(t)||rate.code.toLowerCase()===t?1:0),0)})).filter(r=>r.score>0).sort((a,b)=>b.score-a.score).slice(0,6).map(({score,tariff_id,area,...r})=>r)}
