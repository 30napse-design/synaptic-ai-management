import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'SYNAPSE | فضای کار کارکنان',description:'برنامه‌ریزی، کارتابل و بررسی عملیات پژوهشکده'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}
