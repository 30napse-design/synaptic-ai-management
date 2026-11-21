// Never trust an upload's extension or declared MIME for inline rendering.
export function previewMime(bytes:Uint8Array){
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return 'image/png';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 const head=new TextDecoder().decode(bytes);
 if(head.startsWith('%PDF-'))return 'application/pdf';
 if(head.startsWith('RIFF')&&head.slice(8,12)==='WEBP')return 'image/webp';
 return '';
}
export const canPreviewFile=(mime:string)=>['image/png','image/jpeg','image/webp','application/pdf'].includes(mime);
