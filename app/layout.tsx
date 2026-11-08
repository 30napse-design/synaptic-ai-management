import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://synapse.ekramiihamid.chatgpt.site'),title:'SYNAPSE | سامانه یکپارچه پژوهشکده',description:'کارتابل عملیات، تماس‌ها، برنامه‌ریزی و پیگیری خدمات پژوهشکده',icons:{icon:'/brand/synapse-square.jpeg',apple:'/brand/synapse-square.jpeg'},openGraph:{title:'SYNAPSE | سامانه یکپارچه پژوهشکده',description:'برنامه‌ریزی، اجرا و پیگیری خدمات پژوهشی',images:[{url:'/brand/synapse-horizontal.jpeg',width:1536,height:702,alt:'SYNAPSE'}]},twitter:{card:'summary_large_image',images:['/brand/synapse-horizontal.jpeg']}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
