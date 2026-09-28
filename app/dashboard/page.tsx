'use client';
import {FormEvent,useEffect,useState} from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import InstallCard from '@/components/InstallCard';
import {pointsForCents} from '@/lib/points';
import {ORDER_URL} from '@/lib/orderUrl';

const STATUS:Record<string,string>={pending:'Waiting for review',approved:'Approved',rejected:'Not approved'};

export default function Dashboard(){
  const [u,setU]=useState<any>(null);
  const [qr,setQr]=useState('');
  const [rewards,setRewards]=useState<any[]>([]);
  const [purchases,setPurchases]=useState<any[]>([]);
  const [claims,setClaims]=useState<any[]>([]);
  const [ref,setRef]=useState('');
  const [amount,setAmount]=useState('');
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState('');
  const [err,setErr]=useState('');

  async function loadClaims(){const c=await fetch('/api/claims');if(c.ok)setClaims((await c.json()).claims||[])}
  async function load(){
    const m=await fetch('/api/me');
    if(!m.ok){location.href='/login';return}
    const d=await m.json();
    if(d.user.must_upgrade_password){location.href='/update-password';return}
    setU(d.user);
    setQr(await QRCode.toDataURL(JSON.stringify({type:'foodie-zone-reward',memberId:d.user.member_id}),{margin:1,width:520}));
    const x=await fetch('/api/rewards');
    setRewards(((await x.json()).rewards||[]).sort((a:any,b:any)=>a.points_cost-b.points_cost));
    const p=await fetch('/api/purchases');if(p.ok)setPurchases((await p.json()).purchases||[]);
    loadClaims();
  }
  useEffect(()=>{load()},[]);

  async function claim(e:FormEvent){
    e.preventDefault();setMsg('');setErr('');setBusy(true);
    try{
      const r=await fetch('/api/claims',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderRef:ref,amount})});
      const d=await r.json();
      if(!r.ok){setErr(d.error||'Could not submit your claim.');return}
      setRef('');setAmount('');setMsg('Thanks! Staff will check your order and add your points.');loadClaims();
    }catch{setErr('Could not submit your claim right now.')}
    finally{setBusy(false)}
  }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});location.href='/'}

  if(!u)return <main className="wrap"><div className="card">Loading...</div></main>;

  // Progress toward the next reward the customer can't afford yet.
  const next=rewards.find(r=>r.points_cost>u.points);
  const affordable=rewards.filter(r=>r.points_cost<=u.points);
  const pct=next?Math.min(100,Math.round((u.points/next.points_cost)*100)):100;
  const estimate=pointsForCents(Math.round(Number(amount)*100)||0);

  return <>
    <header className="top"><div className="brand">FOODIE ZONE REWARDS</div>
      <div className="links top-links"><a className="order" href={ORDER_URL}>Order Online</a><Link href="/menu" className="secondary">Menu</Link><Link href="/settings" className="secondary">Settings</Link><button className="secondary" onClick={logout}>Logout</button></div></header>
    <main className="wrap">
      <section className="hero"><h1>Welcome, {u.name}</h1><p>Your Foodie Zone Rewards account</p></section>
      {msg&&<div className="success">{msg}</div>}{err&&<div className="error">{err}</div>}
      <InstallCard/>

      {rewards.length>0&&<div className="card progress-card">
        <div className="progress-head"><strong>{next?`${next.points_cost-u.points} points to go`:'Your rewards are ready'}</strong><span className="muted">{next?next.name:'Show your QR code to staff'}</span></div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="bar-fill" style={{width:pct+'%'}}/></div>
        <div className="progress-foot"><span>{u.points} points</span>{next&&<span>{next.points_cost} points</span>}</div>
        {affordable.length>0&&<div className="notice" style={{marginBottom:0}}>You can redeem now: <strong>{affordable.map(r=>r.name).join(', ')}</strong>. Show your QR code to staff.</div>}
      </div>}

      <div className="grid dash-grid">
        <div className="card mini"><div className="muted">Member ID</div><div className="stat">{u.member_id}</div></div>
        <div className="card mini"><div className="muted">Points</div><div className="stat">{u.points}</div></div>
        <div className="card qr-card"><h2>Your reward QR code</h2><p className="muted">Show this code to staff when you want to redeem a reward.</p><div className="qr"><img src={qr} alt="Your Foodie Zone reward QR code" width={230} height={230}/></div></div>
      </div>

      <h2 style={{marginTop:28}}>Ordered online?</h2>
      <div className="card">
        <p className="muted">Online orders through FoodBooking are checked by staff before points are added. Enter your order number and what you paid. You earn 25 points for every R100.</p>
        <form onSubmit={claim}>
          <div className="field"><label>Order number</label><input value={ref} onChange={e=>setRef(e.target.value)} placeholder="From your FoodBooking confirmation" required/></div>
          <div className="field"><label>Total paid (R)</label><input type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} required/>{estimate>0&&<span className="muted" style={{margin:0,fontSize:13}}>About {estimate} points once approved</span>}</div>
          <button className="primary" disabled={busy}>{busy?'Sending...':'Claim my points'}</button>
        </form>
        {claims.length>0&&<div className="claim-list">{claims.map(c=><div className="claim-row" key={c.id}>
          <div><strong>{c.order_ref}</strong><div className="muted" style={{margin:0,fontSize:13}}>R{(c.amount_cents/100).toFixed(2)} · {new Date(c.created_at).toLocaleDateString()}</div></div>
          <span className={'pill pill-'+c.status}>{STATUS[c.status]||c.status}{c.status==='approved'?` +${c.points_awarded}`:''}</span></div>)}</div>}
      </div>

      <h2 style={{marginTop:28}}>Purchase history</h2>
      <div className="card"><p className="muted">Completed online and store purchases linked to your member account.</p>
        {purchases.length?<table className="responsive"><thead><tr><th>Date</th><th>Source</th><th>Amount</th><th>Points</th></tr></thead><tbody>{purchases.map(p=><tr key={p.id}><td data-label="Date">{new Date(p.purchased_at).toLocaleDateString()}</td><td data-label="Source">{p.source}</td><td data-label="Amount">R{(p.amount_cents/100).toFixed(2)}</td><td data-label="Points">+{p.points_earned}</td></tr>)}</tbody></table>:<p className="muted">No purchases linked yet.</p>}
      </div>

      <h2 style={{marginTop:28}}>Rewards</h2>
      <div className="grid">{rewards.map(x=>{const ok=u.points>=x.points_cost;const p=Math.min(100,Math.round(u.points/x.points_cost*100));return <div className="card reward" key={x.id}>
        <h3>{x.name}</h3><div className="muted">{x.description}</div><strong>{x.points_cost} points</strong>
        <div className="bar bar-sm"><div className="bar-fill" style={{width:p+'%'}}/></div>
        <div className="notice">{ok?'Show your QR code to staff to redeem this reward.':`${x.points_cost-u.points} more points needed`}</div></div>})}</div>
      <div className="links" style={{marginTop:20}}><Link href="/">Home</Link></div>
    </main>
  </>;
}
