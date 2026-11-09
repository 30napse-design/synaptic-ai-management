// Existing assigned work remains editable; only a new self-assignment is blocked.
export const SELF_ASSIGNMENT_ERROR='ارجاع کار به خود مجاز نیست؛ مسئول دیگری انتخاب کنید یا از مدیریت بخواهید کار را ارجاع دهد.';
export function isPrimaryOwner(u:any){return !!u&&!u.local&&!u.laboratory&&u.manager===true&&u.email==='ekramiihamid@gmail.com'}
export function mayAssignWork(u:any,assignee:string,previous?:string){return !!u&&(assignee!==u.email||assignee===previous||isPrimaryOwner(u))}
