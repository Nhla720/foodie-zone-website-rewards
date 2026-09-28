'use client';
import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

export default function Admin(){
  const router=useRouter();
  useEffect(()=>{(async()=>{
    const res=await fetch('/api/admin/whoami');
    if(res.status===401)router.push('/admin/login');
  })()},[router]);

  async function logout(){await fetch('/api/auth/logout',{method:'POST'});location.href='/admin/login'}

  return <main className="wrap">
    <div className="hero"><h1>Foodie Zone Admin</h1><p>Manage rewards, customers and staff access.</p></div>
    <div className="grid">
      <Link className="card" href="/admin/rewards"><h2>Manage rewards</h2><p className="muted">Add or delete rewards customers can redeem.</p></Link>
      <Link className="card" href="/admin/claims"><h2>Order claims</h2><p className="muted">Approve online orders customers have claimed points for.</p></Link>
      <Link className="card" href="/admin/menu"><h2>Menu</h2><p className="muted">Edit menu items, prices and photos.</p></Link>
      <Link className="card" href="/admin/purchases"><h2>Purchases</h2><p className="muted">Record store purchases and review imported online orders.</p></Link>
      <Link className="card" href="/admin/scan"><h2>Scan customer QR</h2><p className="muted">Scan a member's QR code and redeem an offer.</p></Link>
      <Link className="card" href="/admin/customers"><h2>Customers</h2><p className="muted">Search customers, adjust points, or delete an account.</p></Link>
      <Link className="card" href="/admin/staff"><h2>Staff accounts</h2><p className="muted">Add or remove admin logins.</p></Link>
    </div>
    <button className="secondary" style={{marginTop:20}} onClick={logout}>Logout</button>
  </main>;
}
