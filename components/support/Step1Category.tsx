import {type LucideIcon,BarChart3,ChevronLeft,ClipboardList,FlaskConical,Headphones,Layers,MessageCircle,ShoppingCart,SlidersHorizontal,Users} from 'lucide-react';
import {unifiedIntakeCategories} from '../../lib/unified-intake-taxonomy';
import {selectCategory} from '../../lib/validations/support-wizard-validation';
import type {WizardStepProps} from '../../types/support-wizard';

const guide:Record<string,readonly [LucideIcon,string]>={
 service_orders:[ShoppingCart,'ثبت سفارش خدمات پژوهشی و آزمایشگاهی'],
 service_projects:[Layers,'پیگیری وضعیت، زمان‌بندی و هماهنگی پروژه'],
 service_results:[BarChart3,'دریافت و پیگیری نتایج، گزارش‌ها و خدمات تحلیلی'],
 service_finance:[ClipboardList,'پیگیری پیش‌فاکتور، صورت‌حساب، پرداخت و قرارداد'],
 service_admin:[Users,'درخواست معرفی‌نامه، مجوز و مکاتبات اداری'],
 service_it:[Headphones,'پیگیری مشکلات سامانه، دسترسی‌ها و خدمات عمومی'],
 consult_before:[MessageCircle,'دریافت راهنمایی و ارزیابی اولیه ایده و نیازها'],
 consult_change:[SlidersHorizontal,'بررسی و اصلاح سفارش ثبت‌شده'],
 consult_execution:[FlaskConical,'مشاوره و هماهنگی در طول اجرای پژوهش'],
 consult_results:[BarChart3,'تحلیل و تفسیر نتایج و گزارش نهایی'],
} as const;

export function Step1Category({data,updateData}:WizardStepProps){
 return <div className="sw-groups">
  {(['services','consultation'] as const).map(group=><section key={group} className={'sw-group '+group}>
   <h2>{group==='services'?'خدمات و پیگیری':'مشاوره تخصصی'}</h2>
   <p>{group==='services'?'ثبت و پیگیری سفارش‌ها، پروژه‌ها و درخواست‌های جاری':'راهنمایی تخصصی در مراحل سفارش، اجرا و گزارش پژوهش'}</p>
   <div className="sw-category-grid">
    {unifiedIntakeCategories.filter(c=>c.group===group).map(c=>{
     const [Icon,description]=guide[c.id]??[Layers,c.title];
     return <button type="button" className="sw-choice" key={c.id} aria-pressed={data.categoryId===c.id} onClick={()=>updateData(selectCategory(data,c.id))}>
      <span className="sw-category-icon"><Icon size={20} aria-hidden="true"/></span>
      <span><strong>{c.title}</strong><small>{description}</small></span>
      <ChevronLeft size={16} aria-hidden="true"/>
     </button>;
    })}
   </div>
  </section>)}
 </div>;
}
