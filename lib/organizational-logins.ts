// Login labels are independent of persistent member and workflow position identifiers.
export const organizationalLogins:Record<string,string>={executive_director:'executive',customer_manager:'customer',scientific_manager:'scientific',finance_manager:'finance',research_manager:'research',administration_manager:'admin',it_security_manager:'it',research_specialist:'specialist'};

export const organizationalUsernames=['owner',...Object.values(organizationalLogins)];
export const organizationalCode=(username:string)=>username==='owner'?'management':Object.keys(organizationalLogins).find(k=>organizationalLogins[k]===username);
