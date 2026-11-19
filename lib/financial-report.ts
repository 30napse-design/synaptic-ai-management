import {PDFDocument,rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fontData from '../assets/finance-reports/DejaVuSans.ttf?inline';
import {bankPDFRuns} from './bank-bidi';
export async function financialPDF(paragraphs:{text:string;size?:number}[]){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);const encoded=fontData.slice(fontData.indexOf(',')+1),font=await doc.embedFont(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0)),{subset:true});let page=doc.addPage([595,842]),y=800;const text=(value:string,size=10)=>{const clean=String(value).replace(/[\r\n\t]/g,' '),words=clean.split(' ');let line='';for(const word of words){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>500&&line){draw(line,size);line=word;}else line=next;}if(line)draw(line,size);};function draw(line:string,size:number){if(y<45){page=doc.addPage([595,842]);y=800;}const runs=bankPDFRuns(line),width=runs.reduce((n,run)=>n+font.widthOfTextAtSize(run,size),0);if(width>500&&line.length>1){const mid=Math.floor(line.length/2);draw(line.slice(0,mid),size);draw(line.slice(mid),size);return;}let x=Math.max(45,550-width);for(const run of runs){page.drawText(run,{x,y,font,size,color:rgb(.18,.14,.24)});x+=font.widthOfTextAtSize(run,size);}y-=size+9;}

 for(const p of paragraphs)text(p.text,p.size||10);return doc.save();
}
