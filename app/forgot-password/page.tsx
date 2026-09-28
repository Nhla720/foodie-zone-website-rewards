'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
export default function ForgotPassword(){
 const [email,setEmail]=useState(''),[message,setMessage]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setErr('');setMessage('');setBusy(true);try{const res=await fetch('/api/auth/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});const d=await res.json();if(!res.ok)setErr(d.error||'Unable to send reset link.');else setMessage(d.message)}catch{setErr('Unable to send reset link. Please try again.')}finally{setBusy(false)}}
 return <main className="wrap"><div className="card form"><div className="eyebrow">ACCOUNT RECOVERY</div><h1>Forgot your password?</h1><p className="muted">Enter your email and we’ll send you a secure password reset link.</p>{err&&<div className="error">{err}</div>}{message&&<div className="success">{message}</div>}<form onSubmit={submit}><div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></div><button className="primary" disabled={busy}>{busy?'Sending...':'Send reset link'}</button></form><div className="links"><Link href="/login">Back to login</Link><Link href="/">Home</Link></div></div></main>
}
