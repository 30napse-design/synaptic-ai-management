export interface SupportWizardData {
 categoryId:string; topicTitle:string; name:string; mobile:string; email:string; description:string;
 orderNumber:string; organization:string; files:File[]; followUpDate:string;
}
export interface WizardStepProps {data:SupportWizardData;updateData:(updates:Partial<SupportWizardData>)=>void;isInternalStaff:boolean}
export const initialSupportData=():SupportWizardData=>({categoryId:'',topicTitle:'',name:'',mobile:'',email:'',description:'',orderNumber:'',organization:'',files:[],followUpDate:''});
