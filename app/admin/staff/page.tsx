'use client';
import {FormEvent,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function Staff(){
  const router=useRouter();
  const [admins,setAdmins]=useState<any[]>([]);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');
  const [busy,setBusy]=useState(false);

  async function load(){
    const res=await fetch('/api/admin/staff');
    if(res.status===401){router.push('/admin/login');return}
    const d=await res.json();
    if(res.ok)setAdmins(d.admins||[]);else setErr(d.error||'Could not load staff accounts');
  }
  useEffect(()=>{load()},[]);

  async function add(e:FormEvent){
    e.preventDefault();setMsg('');setErr('');setBusy(true);
    try{
      const res=await fetch('/api/admin/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
      const d=await res.json();
      if(!res.ok){setErr(d.error||'Could not create admin account.');return}
      setMsg('Admin account created for '+d.admin.name+'.');
      setName('');setEmail('');setPassword('');
      load();
    }finally{setBusy(false)}
  }

  async function remove(id:number,label:string){
    if(!confirm('Remove admin access for '+label+'? They will still have a regular customer account.'))return;
    setMsg('');setErr('');
    const res=await fetch('/api/admin/staff?id='+id,{method:'DELETE'});
    const d=await res.json();
    if(!res.ok)return setErr(d.error||'Could not remove admin access');
    setMsg('Admin access removed.');
    load();
  }

  return <main className="wrap">
    <div className="hero"><h1>Staff accounts</h1><p>Each admin logs in with their own email and password instead of a shared key.</p></div>
    {msg&&<div className="success">{msg}</div>}
    {err&&<div className="error">{err}</div>}
    <div className="card form" style={{margin:'0 0 22px'}}>
      <h2>Add an admin</h2>
      <form onSubmit={add}>
        <div className="field"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required/></div>
        <div className="field"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="field"><label>Password</label><input type="password" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} required/><span className="muted" style={{fontSize:12,margin:0,display:'block'}}>At least 8 characters, with a letter and a number. No common or sequential passwords.</span></div>
        <button className="primary" disabled={busy}>{busy?'Creating...':'Create admin account'}</button>
      </form>
    </div>
    <div className="card">
      <h2>Current admins</h2>
      <div className="table-scroll"><table className="responsive">
        <thead><tr><th>Name</th><th>Email</th><th>Added</th><th></th></tr></thead>
        <tbody>
          {admins.map(a=>
            <tr key={a.id}>
              <td data-label="Name">{a.name}</td>
              <td data-label="Email">{a.email}</td>
              <td data-label="Added">{new Date(a.created_at).toLocaleDateString()}</td>
              <td className="actions-cell"><button className="danger" onClick={()=>remove(a.id,a.name)}>Remove access</button></td>
            </tr>
          )}
        </tbody>
      </table></div>
    </div>
    <div className="links" style={{marginTop:20}}><Link href="/admin">Back to admin home</Link></div>
  </main>;
}
