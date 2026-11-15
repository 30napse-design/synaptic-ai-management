export const CENTRAL_EMAIL='synapticsite@gmail.com';
export const AVAILABLE_PERMISSIONS=['institute_admin','petty_cash','people','projects','lab','lab_operations','lab_portal','finance_ops','finance_approve','science_approve','mail','operations','calls','billing_ops','results_ops','development','resources','tariffs'];
export const DEFAULT_PERMISSIONS=['people','projects','lab','mail','operations','calls','results_ops','development','resources','tariffs'];
export const SHARED_OPERATIONS_PERMISSIONS=['operations','calls'];
export const effectivePermissions=(permissions:string[]=[])=>[...new Set([...permissions,...SHARED_OPERATIONS_PERMISSIONS])];
export const COOKIE_NAME='__Host-synapse_staff';
export const SESSION_SECONDS=8*60*60;
export const moduleKinds:Record<string,string>={projects:'project',lab:'order',mail:'correspondence',development:'development',science:'scientific',contracts:'contract'};
export const kindModules:Record<string,string>={project:'projects',order:'lab',correspondence:'mail',development:'development',scientific:'results_ops',contract:'billing_ops'};
export function hasAccess(user:any,section:string){if(!user)return false;if(SHARED_OPERATIONS_PERMISSIONS.includes(section))return true;if(user?.laboratory)return ['lab','lab_portal'].includes(section);if(['science','results_ops'].includes(section)&&user?.permissions?.includes('science_approve'))return true;if(['billing_ops','tariffs'].includes(section)&&user?.permissions?.includes('finance_ops'))return true;section=({science:'results_ops',contracts:'billing_ops'} as Record<string,string>)[section]||section;return !!user&&(user.manager||user.permissions?.includes('institute_admin')||section==='people'||(user.permissions||[]).includes(section))}
export function passwordValid(value:unknown){return typeof value==='string'&&value.length>=14&&value.length<=128&&/[a-z]/.test(value)&&/[A-Z]/.test(value)&&/[0-9]/.test(value)}
export function usernameValid(value:unknown){return typeof value==='string'&&/^[a-z][a-z0-9._-]{2,39}$/.test(value)}

// Menu availability never grants access to operational data.
export function hasDataAccess(user:any,scope:string){if(!user||user.laboratory)return false;if(user.manager)return true;const permissions=user.dataPermissions??user.permissions??[];return permissions.includes(scope)||(scope==='billing_ops'&&permissions.includes('finance_ops'))||(scope==='results_ops'&&permissions.includes('science_approve'))}
