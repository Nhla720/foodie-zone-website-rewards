'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function RewardsAdmin(){
  const router=useRouter();
  const [r,setR]=useState<any[]>([]);
  const [n,setN]=useState('');
  const [d,setD]=useState('');
  const [p,setP]=useState('');
  const [msg,setMsg]=useState('');

  async function load(){
    const x=await fetch('/api/admin/rewards');
    if(x.status===401){router.push('/admin/login');return}
    const j=await x.json();
    if(!x.ok)return setMsg(j.error||'Could not load rewards');
    setR(j.rewards||[]);
  }
  useEffect(()=>{load()},[]);

  async function add(){
    const x=await fetch('/api/admin/rewards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:n,description:d,pointsCost:Number(p)})});
    const j=await x.json();
    if(!x.ok)return setMsg(j.error);
    setN('');setD('');setP('');setMsg('Reward added');load();
  }

  async function del(id:number){
    if(!confirm('Delete this reward?'))return;
    const x=await fetch('/api/admin/rewards?id='+id,{method:'DELETE'});
    const j=await x.json();
    if(!x.ok)return setMsg(j.error);
    load();
  }

  return <main className="wrap">
    <div className="hero"><h1>Rewards</h1><p>Add or remove redeemable items.</p></div>
    {msg&&<div className="notice">{msg}</div>}
    <div className="card">
      <h2>Add reward</h2>
      <div className="field"><label>Name</label><input value={n} onChange={x=>setN(x.target.value)}/></div>
      <div className="field"><label>Description</label><input value={d} onChange={x=>setD(x.target.value)}/></div>
      <div className="field"><label>Points cost</label><input type="number" value={p} onChange={x=>setP(x.target.value)}/></div>
      <button className="primary" onClick={add}>Add reward</button>
    </div>
    <h2>Current rewards</h2>
    <div className="grid">
      {r.map(x=>
        <div className="card reward" key={x.id}>
          <h3>{x.name}</h3>
          <div className="muted">{x.description}</div>
          <strong>{x.points_cost} points</strong>
          <button className="danger" onClick={()=>del(x.id)}>Delete</button>
        </div>
      )}
    </div>
  </main>;
}
