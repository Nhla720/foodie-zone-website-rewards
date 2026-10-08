'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
type Cart={id:number;name:string;price_cents:number;quantity:number;image:string|null};
const KEY='fz_cart_v3'; const money=(n:number)=>'R'+(n/100).toFixed(2);
function read():Cart[]{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export default function CartPage(){const [cart,setCart]=useState<Cart[]>([]);useEffect(()=>setCart(read()),[]);
function save(next:Cart[]){setCart(next);localStorage.setItem(KEY,JSON.stringify(next))}
function change(id:number,d:number){save(cart.map(x=>x.id===id?{...x,quantity:Math.max(0,x.quantity+d)}:x).filter(x=>x.quantity>0))}
const subtotal=cart.reduce((s,x)=>s+x.price_cents*x.quantity,0);
return <main className="wrap"><div className="hero"><h1>Your Cart</h1><p>Review your Foodie Zone order before checkout.</p></div>{!cart.length?<div className="card"><h2>Your cart is empty</h2><Link className="button button-pink" href="/menu">Browse menu</Link></div>:<div className="split-order"><section className="card">{cart.map(x=><div className="cart-row" key={x.id}><div><strong>{x.name}</strong><div className="muted">{money(x.price_cents)} each</div></div><div className="qty"><button className="secondary" onClick={()=>change(x.id,-1)}>−</button><b>{x.quantity}</b><button className="secondary" onClick={()=>change(x.id,1)}>+</button></div></div>)}</section><aside className="card"><div className="tot"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p className="muted">Delivery adds R25 at checkout. Rewards points are added when your order is completed.</p><Link className="button button-pink button-large" style={{width:'100%'}} href="/checkout">Checkout</Link></aside></div>}</main>}