import bidiFactory from 'bidi-js';
const bidi=bidiFactory();
// Reorder directional runs, not Arabic characters: fontkit shapes/reverses each
// logical Arabic run. Numbers keep their own LTR run and never reverse digits.
export function bankPDFRuns(value:string):string[]{
 const text=String(value).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c)));
 if(!text)return [];
 const embedding=bidi.getEmbeddingLevels(text,/[\u0600-\u06ff]/.test(text)?'rtl':'ltr'),mirrored=bidi.getMirroredCharactersMap(text,embedding),runs:{start:number;end:number;text:string}[]=[];
 for(let start=0;start<text.length;){let end=start;while(end+1<text.length&&embedding.levels[end+1]===embedding.levels[start])end++;runs.push({start,end,text:Array.from({length:end-start+1},(_,i)=>mirrored.get(start+i)||text[start+i]).join('')});start=end+1;}
 const order=Array.from({length:text.length},(_,i)=>i);for(const [start,end]of bidi.getReorderSegments(text,embedding)){const part=order.slice(start,end+1).reverse();order.splice(start,part.length,...part);}
 const seen=new Set<number>(),visual:string[]=[];for(const index of order){const run=runs.findIndex(r=>index>=r.start&&index<=r.end);if(!seen.has(run)){seen.add(run);visual.push(runs[run].text);}}return visual;
}
