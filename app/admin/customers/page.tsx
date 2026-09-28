'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function Customers(){
  const router=useRouter();
  const [q,setQ]=useState('');
  const [list,setList]=useState<any[]>([]);
  const [edits,setEdits]=useState<Record<number,string>>({});
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');

  async function load(query:string){
    setErr('');
    const res=await fetch('/api/admin/customers?q='+encodeURIComponent(query));
    if(res.status===401){router.push('/admin/login');return}
    const d=await res.json();
    if(!res.ok)return setErr(d.error||'Could not load customers');
    setList(d.customers||[]);
  }
  useEffect(()=>{load('')},[]);

  async function search(){await load(q)}

  async function savePoints(id:number){
    setMsg('');setErr('');
    const points=edits[id];
    if(points===undefined)return;
    const res=await fetch('/api/admin/customers',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,points:Number(points)})});
    const d=await res.json();
    if(!res.ok)return setErr(d.error||'Could not update points');
    setMsg('Points updated for '+d.customer.name+'.');
    load(q);
  }

  async function del(id:number,name:string){
    if(!confirm('Delete '+name+'? This removes their account and reward history. Purchase records are kept but unlinked.'))return;
    setMsg('');setErr('');
    const res=await fetch('/api/admin/customers?id='+id,{method:'DELETE'});
    const d=await res.json();
    if(!res.ok)return setErr(d.error||'Could not delete customer');
    setMsg('Customer deleted.');
    load(q);
  }

  return <main className="wrap">
    <div className="hero"><h1>Customers</h1><p>Search customers, adjust points, or remove an account.</p></div>
    <div className="card">
      <div className="field"><label>Search (name, email or member ID)</label><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')search()}}/></div>
      <button className="secondary" onClick={search}>Search</button>
    </div>
    {msg&&<div className="success">{msg}</div>}
    {err&&<div className="error">{err}</div>}
    <div className="card" style={{marginTop:18}}>
      <div className="table-scroll"><table className="responsive">
        <thead><tr><th>Member ID</th><th>Name</th><th>Email</th><th>Points</th><th>Joined</th><th></th></tr></thead>
        <tbody>
          {list.map(c=>
            <tr key={c.id}>
              <td data-label="Member ID">{c.member_id}</td>
              <td data-label="Name">{c.name}</td>
              <td data-label="Email">{c.email}</td>
              <td data-label="Points" className="points-cell">
                <input type="number" min="0" className="points-input" defaultValue={c.points} onChange={e=>setEdits(x=>({...x,[c.id]:e.target.value}))}/>
                <button className="secondary" onClick={()=>savePoints(c.id)}>Save</button>
              </td>
              <td data-label="Joined">{new Date(c.created_at).toLocaleDateString()}</td>
              <td className="actions-cell"><button className="danger" onClick={()=>del(c.id,c.name)}>Delete</button></td>
            </tr>
          )}
          {!list.length&&<tr><td colSpan={6} className="muted empty-cell">No customers found.</td></tr>}
        </tbody>
      </table></div>
    </div>
  </main>;
}
