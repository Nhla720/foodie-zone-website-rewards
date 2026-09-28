'use client';
import {useEffect,useState} from 'react';

// Shows an "Install app" card when the browser allows it (Android/Chrome/Edge) or how-to text on iPhone.
export default function InstallCard(){
  const [evt,setEvt]=useState<any>(null);
  const [ios,setIos]=useState(false);
  const [installed,setInstalled]=useState(true);
  const [dismissed,setDismissed]=useState(false);
  useEffect(()=>{
    const standalone=window.matchMedia('(display-mode: standalone)').matches||(navigator as any).standalone===true;
    setInstalled(standalone);
    setDismissed(localStorage.getItem('fz-install-dismissed')==='1');
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!(window as any).MSStream);
    const h=(e:Event)=>{e.preventDefault();setEvt(e)};
    window.addEventListener('beforeinstallprompt',h);
    window.addEventListener('appinstalled',()=>setInstalled(true));
    return()=>window.removeEventListener('beforeinstallprompt',h);
  },[]);
  if(installed||dismissed||(!evt&&!ios))return null;
  const close=()=>{localStorage.setItem('fz-install-dismissed','1');setDismissed(true)};
  return <div className="card install-card">
    <div><strong>Add Foodie Zone Rewards to your home screen</strong>
      <p className="muted" style={{margin:'4px 0 0'}}>{evt?'Open your points and QR code in one tap, like any other app.':'Tap the Share button in Safari, then choose “Add to Home Screen”.'}</p></div>
    <div className="links">
      {evt&&<button className="primary inline-btn" onClick={async()=>{evt.prompt();await evt.userChoice.catch(()=>{});setEvt(null)}}>Install app</button>}
      <button className="secondary" onClick={close}>Not now</button>
    </div>
  </div>;
}
