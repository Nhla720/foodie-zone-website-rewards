'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {pointsForCents} from '@/lib/points';
import {ORDER_URL} from '@/lib/orderUrl';

type Item={id:number;name:string;description:string;price_cents:number;category:string;image:string|null};

export default function Menu(){
  const [items,setItems]=useState<Item[]|null>(null);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{fetch('/api/menu').then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>setFailed(true))},[]);

  const groups:Record<string,Item[]>={};
  (items||[]).forEach(i=>{(groups[i.category]=groups[i.category]||[]).push(i)});

  return <main className="menu-page">
    <header className="top"><Link href="/" className="brand">FOODIE ZONE</Link><div className="links"><Link href="/rewards" className="secondary">Rewards</Link><a href={ORDER_URL} className="order">Order Online</a></div></header>
    <div className="wrap">
      <section className="hero"><h1>Our Menu</h1><p>See what&apos;s on offer, then order online. Rewards members earn points on every order.</p></section>
      <div className="notice earn-banner"><strong>Earn 25 points for every R100 you spend.</strong> <Link href="/register" className="text-link inline">Join Foodie Zone Rewards</Link></div>
      {failed&&<div className="error">The menu could not be loaded. Please try again shortly.</div>}
      {!items&&!failed&&<div className="card">Loading menu...</div>}
      {items&&!items.length&&<div className="card muted">The menu is being updated. Check back soon.</div>}
      {Object.entries(groups).map(([cat,list])=><section key={cat}>
        {Object.keys(groups).length>1&&<h2 className="cat-title">{cat}</h2>}
        <div className="menu-grid">{list.map(i=>{const pts=pointsForCents(i.price_cents);return <article className="menu-card" key={i.id}>
          {i.image?<img className="menu-img" src={i.image} alt={i.name} loading="lazy"/>:<div className="menu-img menu-ph" aria-hidden="true"><span>{i.name.trim().charAt(0).toUpperCase()}</span></div>}
          <div className="menu-body"><h3>{i.name}</h3>{i.description&&<p className="menu-desc">{i.description}</p>}
            <div className="menu-foot"><strong className="menu-price">R{(i.price_cents/100).toFixed(2)}</strong>{pts>0&&<span className="pts-tag">+{pts} pts</span>}</div></div>
        </article>})}</div>
      </section>)}
    </div>
    <div className="order-bar"><a href={ORDER_URL} className="button button-pink button-large">Order online</a></div>
  </main>
}
