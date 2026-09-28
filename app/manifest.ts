import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{
  return {
    name:'Foodie Zone Rewards',
    short_name:'Foodie Zone',
    description:'Your Foodie Zone points, rewards and member QR code.',
    start_url:'/dashboard',
    scope:'/',
    display:'standalone',
    orientation:'portrait',
    background_color:'#1A1A1A',
    theme_color:'#1A1A1A',
    icons:[
      {src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
      {src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
      {src:'/icons/maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
    ],
  };
}
