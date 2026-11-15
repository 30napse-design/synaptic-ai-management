export const DATA_OWNER='ekramiihamid@gmail.com';
export const canDeleteData=(u:any)=>!!u&&!u.laboratory&&(!u.local||u.username==='owner'&&u.manager===true)&&u.email?.toLowerCase()===DATA_OWNER;
export const deletionAction=(action:unknown)=>typeof action==='string'&&/(delete|remove|purge|destroy)/i.test(action);
export function restrictLegacyDeletion(script:string,u:any){if(canDeleteData(u))return script;return script.replace(/<button class="delete"[\s\S]*?<\/button>/g,'').replace('if(del){const prev=chats;',"if(del){toast('حذف فقط برای مالک اصلی سامانه مجاز است.');return;}if(del){const prev=chats;")}
