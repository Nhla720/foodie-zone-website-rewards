'use client';
import {FormEvent,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function AdminLogin(){
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault();setErr('');setBusy(true);
    try{
      const res=await fetch('/api/auth/admin-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
      const d=await res.json();
      if(!res.ok){setErr(d.error||'Login failed.');return}
      router.push('/admin');
    }catch{setErr('Unable to log in right now.')}
    finally{setBusy(false)}
  }

  return <main className="wrap">
    <div className="card form">
      <div className="eyebrow">FOODIE ZONE ADMIN</div>
      <h1>Staff login</h1>
      {err&&<div className="error">{err}</div>}
      <form onSubmit={submit}>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></div>
        <div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></div>
        <button className="primary" disabled={busy}>{busy?'Logging in...':'Log in'}</button>
      </form>
    </div>
  </main>;
}
