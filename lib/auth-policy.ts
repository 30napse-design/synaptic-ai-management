export const CENTRAL_EMAIL='synapticsite@gmail.com';
export const AVAILABLE_PERMISSIONS=['people','projects','lab','mail','operations','calls','billing_ops','results_ops'];
export const DEFAULT_PERMISSIONS=['people','projects','lab','mail'];
export const COOKIE_NAME='__Host-synapse_staff';
export const SESSION_SECONDS=8*60*60;
export const moduleKinds:Record<string,string>={projects:'project',lab:'order',mail:'correspondence'};
export const kindModules:Record<string,string>={project:'projects',order:'lab',correspondence:'mail'};
export function hasAccess(user:any,section:string){return !!user&&(user.manager||section==='people'||(user.permissions||[]).includes(section))}
export function passwordValid(value:unknown){return typeof value==='string'&&value.length>=14&&value.length<=128&&/[a-z]/.test(value)&&/[A-Z]/.test(value)&&/[0-9]/.test(value)}
export function usernameValid(value:unknown){return typeof value==='string'&&/^[a-z][a-z0-9._-]{2,39}$/.test(value)}
