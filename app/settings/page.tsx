'use client';
import {FormEvent,useEffect,useState} from 'react';
import Link from 'next/link';

export default function Settings(){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [profileMsg,setProfileMsg]=useState('');
  const [profileErr,setProfileErr]=useState('');
  const [profileBusy,setProfileBusy]=useState(false);

  const [current,setCurrent]=useState('');
  const [next,setNext]=useState('');
  const [confirm,setConfirm]=useState('');
  const [show,setShow]=useState(false);
  const [pwMsg,setPwMsg]=useState('');
  const [pwErr,setPwErr]=useState('');
  const [pwBusy,setPwBusy]=useState(false);

  useEffect(()=>{(async()=>{
    const res=await fetch('/api/me');
    if(!res.ok){location.href='/login';return}
    const d=await res.json();
    setName(d.user.name);
    setEmail(d.user.email);
  })()},[]);

  async function saveProfile(e:FormEvent){
    e.preventDefault();setProfileErr('');setProfileMsg('');setProfileBusy(true);
    try{
      const res=await fetch('/api/me',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email})});
      const d=await res.json();
      if(!res.ok){setProfileErr(d.error||'Could not update your details.');return}
      setProfileMsg('Your details have been updated.');
    }catch{setProfileErr('Could not update your details. Please try again.')}
    finally{setProfileBusy(false)}
  }

  async function savePassword(e:FormEvent){
    e.preventDefault();setPwErr('');setPwMsg('');
    if(next!==confirm)return setPwErr('New passwords do not match.');
    setPwBusy(true);
    try{
      const res=await fetch('/api/auth/change-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({currentPassword:current,newPassword:next})});
      const d=await res.json();
      if(!res.ok){setPwErr(d.error||'Could not update your password.');return}
      setPwMsg(d.message||'Password updated.');
      setCurrent('');setNext('');setConfirm('');
    }catch{setPwErr('Could not update your password. Please try again.')}
    finally{setPwBusy(false)}
  }

  return <main className="wrap">
    <div className="hero"><h1>Account settings</h1><p>Update your details or change your password.</p></div>

    <div className="card form" style={{margin:'0 0 22px'}}>
      <h2>Your details</h2>
      {profileErr&&<div className="error">{profileErr}</div>}
      {profileMsg&&<div className="success">{profileMsg}</div>}
      <form onSubmit={saveProfile}>
        <div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required/></div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <button className="primary" disabled={profileBusy}>{profileBusy?'Saving...':'Save details'}</button>
      </form>
    </div>

    <div className="card form" style={{margin:0}}>
      <h2>Change password</h2>
      {pwErr&&<div className="error">{pwErr}</div>}
      {pwMsg&&<div className="success">{pwMsg}</div>}
      <form onSubmit={savePassword}>
        <div className="field">
          <label>Current password</label>
          <div className="password-field">
            <input type={show?'text':'password'} value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password" required/>
            <button type="button" className="show-password" onClick={()=>setShow(!show)}>{show?'Hide':'Show'}</button>
          </div>
        </div>
        <div className="field"><label>New password</label><input type={show?'text':'password'} minLength={8} value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password" required/><span className="muted" style={{fontSize:12,margin:0,display:'block'}}>At least 8 characters, with a letter and a number. No common or sequential passwords (e.g. 1234567890).</span></div>
        <div className="field"><label>Confirm new password</label><input type={show?'text':'password'} minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" required/></div>
        <button className="primary" disabled={pwBusy}>{pwBusy?'Updating...':'Update password'}</button>
      </form>
    </div>

    <div className="links" style={{marginTop:20}}><Link href="/dashboard">Back to dashboard</Link></div>
  </main>;
}
