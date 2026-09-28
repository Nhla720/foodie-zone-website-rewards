'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';

export default function Scan(){
  const router=useRouter();
  const [customer,setCustomer]=useState<any>(null);
  const [rewards,setRewards]=useState<any[]>([]);
  const [selected,setSelected]=useState('');
  const [result,setResult]=useState('');
  const [err,setErr]=useState('');

  useEffect(()=>{(async()=>{
    const x=await fetch('/api/admin/whoami');
    if(x.status===401)router.push('/admin/login');
  })()},[router]);

  async function loadRewards(){
    const x=await fetch('/api/admin/rewards');
    const j=await x.json();
    if(x.ok)setRewards(j.rewards||[]);
  }

  async function start(){
    setErr('');setResult('');setCustomer(null);
    await loadRewards();
    const {Html5Qrcode}=await import('html5-qrcode');
    const s=new Html5Qrcode('reader');
    try{
      await s.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:240}},async text=>{
        await s.stop();
        let code:any;
        try{code=JSON.parse(text)}catch{setErr('Invalid Foodie Zone QR code');return}
        if(code.type!=='foodie-zone-reward'||!code.memberId)return setErr('Invalid Foodie Zone QR code');
        const x=await fetch('/api/admin/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({memberId:code.memberId})});
        const j=await x.json();
        if(x.status===401){router.push('/admin/login');return}
        if(!x.ok)return setErr(j.error||'Scan failed');
        setCustomer(j.user);
        setResult('Customer verified. Select the reward to redeem.');
      },()=>{});
    }catch{setErr('Camera could not start. Allow camera access and try again.')}
  }

  async function redeem(){
    if(!customer||!selected)return;
    const x=await fetch('/api/admin/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({memberId:customer.member_id,rewardId:Number(selected)})});
    const j=await x.json();
    if(!x.ok)return setErr(j.error||'Redemption failed');
    setResult(`Redeemed ${j.reward.name} for ${j.user.name}. Remaining points: ${j.user.points}.`);
    setCustomer(j.user);setSelected('');
  }

  return <main className="wrap">
    <div className="hero"><h1>Scan customer QR</h1><p>Verify the member, choose an offer, then redeem it.</p></div>
    <div className="card">
      <button className="primary" onClick={start}>Start camera</button>
      <div id="reader" className="scanbox" style={{marginTop:16}}></div>
      {err&&<div className="error">{err}</div>}
      {result&&<div className="success">{result}</div>}
    </div>
    {customer&&<div className="card" style={{marginTop:18}}>
      <h2>{customer.name}</h2>
      <p>Member ID: <strong>{customer.member_id}</strong></p>
      <p>Points available: <strong>{customer.points}</strong></p>
      <div className="field">
        <label>Reward to redeem</label>
        <select value={selected} onChange={x=>setSelected(x.target.value)}>
          <option value="">Select reward</option>
          {rewards.map(x=><option key={x.id} value={x.id}>{x.name} — {x.points_cost} points</option>)}
        </select>
      </div>
      <button className="primary" disabled={!selected} onClick={redeem}>Confirm redemption</button>
    </div>}
  </main>;
}
