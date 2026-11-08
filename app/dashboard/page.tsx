'use client';
import {FormEvent,useEffect,useState} from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {pointsForCents} from '@/lib/points';

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
      setRef('');setAmount('');setMsg('Thanks. Staff will check your order and add your points.');loadClaims();
    }catch{setErr('Could not submit your claim right now.')}
    finally{setBusy(false)}
  }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});location.href='/'}

  if(!u)return <main className="fz-loading"><div className="fz-loading-card">Loading your rewards account...</div></main>;

  const points=Number(u.points)||0;
  const next=rewards.find(r=>Number(r.points_cost)>points);
  const affordable=rewards.filter(r=>Number(r.points_cost)<=points);
  const pct=next?Math.min(100,Math.round((points/Number(next.points_cost))*100)):100;
  const estimate=pointsForCents(Math.round(Number(amount)*100)||0);

  return <div className="fz-app">
    <header className="fz-app-header">
      <Link href="/dashboard" className="fz-wordmark">FOODIE <span>ZONE</span><small>REWARDS CLUB</small></Link>
      <nav className="fz-nav" aria-label="Member navigation">
        <Link href="/settings">Account settings</Link>
        <button onClick={logout}>Log out</button>
      </nav>
    </header>

    <main className="fz-dashboard">
      <section className="fz-welcome">
        <div className="fz-welcome-copy">
          <span className="fz-kicker">YOUR REWARDS ACCOUNT</span>
          <h1>Welcome back, {u.name.split(' ')[0]}.</h1>
          <p>Your Foodie Zone points and rewards, all in one place.</p>
          <div className="fz-member-tag">MEMBER ID <strong>{u.member_id}</strong></div>
        </div>
      </section>

      {msg&&<div className="fz-alert fz-alert-success" role="status">{msg}</div>}
      {err&&<div className="fz-alert fz-alert-error" role="alert">{err}</div>}

      <section className="fz-points-layout">
        <div className="fz-points-card">
          <div className="fz-card-topline"><span>YOUR POINTS BALANCE</span><span className="fz-live-pill">REWARDS MEMBER</span></div>
          <div className="fz-points-number">{points.toLocaleString('en-ZA')} <span>POINTS</span></div>
          <p>{next?(Number(next.points_cost)-points).toLocaleString('en-ZA')+' points until your next reward':'You have enough points for all currently listed rewards.'}</p>
          {rewards.length>0&&<>
            <div className="fz-progress-track" role="progressbar" aria-label="Progress to next reward" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="fz-progress-fill" style={{width:pct+'%'}}/></div>
            <div className="fz-progress-labels"><span>{points.toLocaleString('en-ZA')} points</span><span>{next?Number(next.points_cost).toLocaleString('en-ZA')+' points':'All rewards reached'}</span></div>
          </>}
          {affordable.length>0&&<div className="fz-unlocked-note"><strong>Available to redeem:</strong> {affordable.map(r=>r.name).join(' · ')}. Show your member QR code to staff.</div>}
        </div>
      </section>

      <div className="fz-section-heading"><div><span className="fz-kicker">YOUR MEMBER DETAILS</span><h2>Member QR code</h2></div><p>Show this code to staff when redeeming a reward.</p></div>
      <section className="fz-member-card">
        <div className="fz-qr-wrap">{qr?<img src={qr} alt="Your Foodie Zone reward QR code" width={210} height={210}/>:<div className="fz-qr-placeholder">Preparing your QR code...</div>}</div>
        <div className="fz-member-copy"><span className="fz-kicker">FOODIE ZONE REWARDS</span><h3>Your member pass</h3><p>Staff can scan this code to identify your account and help process your reward redemption.</p><div className="fz-member-id-line"><span>MEMBER ID</span><strong>{u.member_id}</strong></div></div>
      </section>

      <section className="fz-section-heading"><div><span className="fz-kicker">CHOOSE YOUR NEXT TREAT</span><h2>Your rewards</h2></div><p>{rewards.length?rewards.length+' rewards available':'New rewards coming soon'}</p></section>
      {rewards.length>0?<div className="fz-reward-grid">{rewards.map((r,index)=>{const cost=Number(r.points_cost)||0;const canRedeem=points>=cost;const progress=cost>0?Math.min(100,Math.round(points/cost*100)):100;return <article className={'fz-reward-card'+(canRedeem?' is-unlocked':'')} key={r.id}><div className="fz-reward-top"><span>REWARD {String(index+1).padStart(2,'0')}</span><span>{canRedeem?'AVAILABLE':'IN PROGRESS'}</span></div><h3>{r.name}</h3><p>{r.description||'A Foodie Zone reward, saved for you.'}</p><div className="fz-reward-cost">{cost.toLocaleString('en-ZA')} <span>POINTS</span></div><div className="fz-progress-track fz-progress-track-small"><div className="fz-progress-fill" style={{width:progress+'%'}}/></div><div className="fz-reward-foot">{canRedeem?'Show your QR code to staff':(cost-points).toLocaleString('en-ZA')+' points remaining'}</div></article>})}</div>:<div className="fz-empty-card">New rewards are being prepared. Please check back soon.</div>}

      <section className="fz-two-column">
        <div>
          <div className="fz-section-heading fz-section-heading-compact"><div><span className="fz-kicker">EARN YOUR POINTS</span><h2>Submit an order</h2></div></div>
          <div className="fz-content-card">
            <p>Enter your order number and total paid. Staff will verify your order before points are added. You earn 25 points for every R100 spent.</p>
            <form onSubmit={claim}>
              <div className="field"><label>Order number</label><input value={ref} onChange={e=>setRef(e.target.value)} placeholder="Enter your order number" required/></div>
              <div className="field"><label>Total paid (R)</label><input type="number" min="0.01" step="0.01" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="e.g. 150.00" required/>{estimate>0&&<span className="muted" style={{margin:0,fontSize:13}}>Estimated points after approval: {estimate}</span>}</div>
              <button className="fz-submit" disabled={busy}>{busy?'Submitting...':'Submit points claim'}</button>
            </form>
            {claims.length>0&&<div className="fz-claim-list"><h3>Recent claims</h3>{claims.map(c=><div className="fz-claim-row" key={c.id}><div><strong>{c.order_ref}</strong><span>R{(c.amount_cents/100).toFixed(2)} · {new Date(c.created_at).toLocaleDateString()}</span></div><span className={'pill pill-'+c.status}>{STATUS[c.status]||c.status}{c.status==='approved'?' +'+c.points_awarded:''}</span></div>)}</div>}
          </div>
        </div>
        <div>
          <div className="fz-section-heading fz-section-heading-compact"><div><span className="fz-kicker">YOUR REWARDS ACTIVITY</span><h2>Points history</h2></div></div>
          <div className="fz-content-card fz-history-card"><p>Your completed purchases and points earned.</p>{purchases.length?<div className="fz-history-list">{purchases.map(p=><div className="fz-history-row" key={p.id}><div><strong>{new Date(p.purchased_at).toLocaleDateString()}</strong><span>{p.source}</span></div><div><strong>R{(p.amount_cents/100).toFixed(2)}</strong><span>+{p.points_earned} points</span></div></div>)}</div>:<div className="fz-empty-history">Your approved purchases and points will appear here.</div>}</div>
        </div>
      </section>

      <footer className="fz-footer"><Link href="/">FOODIE ZONE REWARDS</Link><Link href="/settings">Account settings</Link></footer>
    </main>
  </div>;
}
