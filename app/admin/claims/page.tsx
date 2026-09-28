'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {pointsForCents} from '@/lib/points';

export default function Claims(){
  const router=useRouter();
  const [list,setList]=useState<any[]>([]);
  const [amt,setAmt]=useState<Record<number,string>>({});
  const [msg,setMsg]=useState('');const [err,setErr]=useState('');

  async function load(){
    const x=await fetch('/api/admin/claims');
    if(x.status===401){router.push('/admin/login');return}
    const j=await x.json();if(!x.ok)return setErr(j.error||'Could not load claims');
    setList(j.claims||[]);
  }
  useEffect(()=>{load()},[]);

  async function act(c:any,action:'approve'|'reject'){
    setMsg('');setErr('');
    const amount=amt[c.id]??(c.amount_cents/100).toFixed(2);
    if(action==='reject'&&!confirm('Reject order '+c.order_ref+'?'))return;
    const x=await fetch('/api/admin/claims',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:c.id,action,amount})});
    const j=await x.json();
    if(!x.ok){setErr(j.error||'Something went wrong');load();return}
    setMsg(action==='approve'?`Approved. +${j.pointsAdded} points added to ${c.name}.`:'Claim rejected.');load();
  }

  const pending=list.filter(c=>c.status==='pending');const done=list.filter(c=>c.status!=='pending');
  return <main className="wrap">
    <div className="hero"><h1>Order claims</h1><p>Check each order number in FoodBooking, confirm the amount, then approve to add the points.</p></div>
    {msg&&<div className="success">{msg}</div>}{err&&<div className="error">{err}</div>}
    <h2>Waiting for review ({pending.length})</h2>
    <div className="card"><div className="table-scroll"><table className="responsive">
      <thead><tr><th>Customer</th><th>Order no.</th><th>Claimed</th><th>Confirmed (R)</th><th>Points</th><th></th></tr></thead>
      <tbody>
        {pending.map(c=>{const a=amt[c.id]??(c.amount_cents/100).toFixed(2);const pts=pointsForCents(Math.round(Number(a)*100)||0);return <tr key={c.id}>
          <td data-label="Customer">{c.name} <span className="muted">({c.member_id})</span></td>
          <td data-label="Order no.">{c.order_ref}</td>
          <td data-label="Claimed">R{(c.amount_cents/100).toFixed(2)}</td>
          <td data-label="Confirmed (R)"><input type="number" min="0" step="0.01" className="points-input" value={a} onChange={e=>setAmt(x=>({...x,[c.id]:e.target.value}))}/></td>
          <td data-label="Points">+{pts}</td>
          <td className="actions-cell"><div className="links"><button className="primary inline-btn" onClick={()=>act(c,'approve')}>Approve</button><button className="danger" onClick={()=>act(c,'reject')}>Reject</button></div></td>
        </tr>})}
        {!pending.length&&<tr><td colSpan={6} className="muted empty-cell">Nothing waiting. All caught up.</td></tr>}
      </tbody></table></div></div>
    <h2 style={{marginTop:28}}>Reviewed</h2>
    <div className="card"><div className="table-scroll"><table className="responsive">
      <thead><tr><th>Customer</th><th>Order no.</th><th>Amount</th><th>Result</th><th>Points</th></tr></thead>
      <tbody>{done.map(c=><tr key={c.id}>
        <td data-label="Customer">{c.name}</td><td data-label="Order no.">{c.order_ref}</td><td data-label="Amount">R{(c.amount_cents/100).toFixed(2)}</td>
        <td data-label="Result">{c.status}</td><td data-label="Points">{c.status==='approved'?'+'+c.points_awarded:'—'}</td></tr>)}
        {!done.length&&<tr><td colSpan={5} className="muted empty-cell">No reviewed claims yet.</td></tr>}
      </tbody></table></div></div>
    <div className="links" style={{marginTop:20}}><Link href="/admin">Back to admin home</Link></div>
  </main>;
}
