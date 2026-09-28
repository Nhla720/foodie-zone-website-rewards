'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function UpdatePassword(){
  const router=useRouter();
  const [ready,setReady]=useState(false);
  const [current,setCurrent]=useState('');
  const [next,setNext]=useState('');
  const [confirm,setConfirm]=useState('');
  const [show,setShow]=useState(false);
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  useEffect(()=>{(async()=>{
    const res=await fetch('/api/me');
    if(!res.ok){location.href='/login';return}
    const d=await res.json();
    if(!d.user.must_upgrade_password){router.push('/dashboard');return}
    setReady(true);
  })()},[router]);

  async function submit(e:FormEvent){
    e.preventDefault();setErr('');
    if(next!==confirm)return setErr('New passwords do not match.');
    setBusy(true);
    try{
      const res=await fetch('/api/auth/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:current,newPassword:next})});
      const d=await res.json();
      if(!res.ok){setErr(d.error||'Could not update your password.');return}
      router.push('/dashboard');
    }catch{setErr('Could not update your password. Please try again.')}
    finally{setBusy(false)}
  }

  if(!ready)return <main className="wrap"><div className="card">Loading...</div></main>;

  return <main className="wrap">
    <div className="card form">
      <div className="eyebrow">SECURITY UPDATE REQUIRED</div>
      <h1>Please set a stronger password</h1>
      <p className="muted">We've raised our password requirements. Enter your current password and choose a new one to continue to your account.</p>
      {err&&<div className="error">{err}</div>}
      <form onSubmit={submit}>
        <div className="field">
          <label>Current password</label>
          <div className="password-field">
            <input type={show?'text':'password'} value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password" required/>
            <button type="button" className="show-password" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button>
          </div>
        </div>
        <div className="field">
          <label>New password</label>
          <input type={show?'text':'password'} minLength={8} value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password" required/>
          <span className="muted" style={{fontSize:12,margin:0,display:'block'}}>At least 8 characters, with a letter and a number. No common or sequential passwords (e.g. 1234567890).</span>
        </div>
        <div className="field"><label>Confirm new password</label><input type={show?'text':'password'} minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" required/></div>
        <button className="primary" disabled={busy}>{busy?'Updating...':'Update password and continue'}</button>
      </form>
    </div>
  </main>;
}
