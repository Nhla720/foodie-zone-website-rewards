'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function Purchases(){
  const router=useRouter();
  const [m,setM]=useState('');
  const [a,setA]=useState('');
  const [s,setS]=useState('store');
  const [o,setO]=useState('');
  const [list,setList]=useState<any[]>([]);
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');

  async function load(){
    const r=await fetch('/api/admin/purchases');
    if(r.status===401){router.push('/admin/login');return}
    const d=await r.json();
    if(r.ok)setList(d.purchases||[]);else setErr(d.error||'Could not load purchases');
  }
  useEffect(()=>{load()},[]);

  async function add(){
    setMsg('');setErr('');
    const r=await fetch('/api/admin/purchases',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({memberId:m,amount:a,source:s,externalOrderId:o||undefined})});
    const d=await r.json();
    if(!r.ok)return setErr(d.error||'Could not add purchase');
    setMsg(`Purchase recorded. +${d.pointsAdded} points.`);setM('');setA('');setO('');load();
  }

  return <main className="wrap">
    <div className="hero"><h1>Purchases</h1><p>Record store purchases manually or review imported online orders.</p></div>
    <div className="card form">
      <div className="field"><label>Member ID</label><input value={m} onChange={e=>setM(e.target.value)} placeholder="FZR-..."/></div>
      <div className="field"><label>Amount (R)</label><input type="number" min="0.01" step="0.01" value={a} onChange={e=>setA(e.target.value)}/></div>
      <div className="field"><label>Purchase source</label><select value={s} onChange={e=>setS(e.target.value)}><option value="store">Store</option><option value="online">Online</option></select></div>
      <div className="field"><label>External order ID (optional)</label><input value={o} onChange={e=>setO(e.target.value)} placeholder="Receipt/order number"/></div>
      <button className="primary" onClick={add}>Record purchase</button>
      {msg&&<div className="success">{msg}</div>}
      {err&&<div className="error">{err}</div>}
    </div>
    <div className="card">
      <h2>Recent purchases</h2>
      <div className="table-scroll"><table className="responsive">
        <thead><tr><th>Customer</th><th>Source</th><th>Order</th><th>Amount</th><th>Points</th></tr></thead>
        <tbody>{list.map(p=><tr key={p.id}><td data-label="Customer">{p.name||p.member_id||'Unlinked'}</td><td data-label="Source">{p.source}</td><td data-label="Order">{p.external_order_id||'—'}</td><td data-label="Amount">R{(p.amount_cents/100).toFixed(2)}</td><td data-label="Points">+{p.points_earned}</td></tr>)}</tbody>
      </table></div>
    </div>
  </main>;
}
