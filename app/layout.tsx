import './globals.css';
import type {Metadata,Viewport} from 'next';
import PwaRegister from '@/components/PwaRegister';
export const metadata:Metadata={
  title:'Foodie Zone',
  description:'Foodie Zone — menu, points, purchases and rewards in one place.',
  applicationName:'Foodie Zone Rewards',
  appleWebApp:{capable:true,title:'Foodie Zone',statusBarStyle:'black-translucent'},
  icons:{icon:[{url:'/icons/icon-192.png',sizes:'192x192',type:'image/png'}],apple:[{url:'/icons/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#1A1A1A'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<PwaRegister/></body></html>}
