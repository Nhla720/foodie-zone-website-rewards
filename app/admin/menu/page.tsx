'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';

type Item={id:number;name:string;description:string;price_cents:number;category:string;available:boolean;image:string|null};

// Shrinks a chosen photo to max 800px JPEG so uploads are small and the site stays fast.
function shrink(file:File):Promise<string>{
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);const img=new Image();
    img.onload=()=>{
      const max=800;const s=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);
      const ctx=c.getContext('2d');if(!ctx){reject(new Error('no canvas'));return}
      ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);resolve(c.toDataURL('image/jpeg',0.82));
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('bad image'))};
    img.src=url;
  });
}

export default function MenuAdmin(){
  const router=useRouter();
  const [items,setItems]=useState<Item[]>([]);
  const [msg,setMsg]=useState('');const [err,setErr]=useState('');
  const [n,setN]=useState('');const [d,setD]=useState('');const [p,setP]=useState('');const [c,setC]=useState('');
  const [img,setImg]=useState<string|null>(null);
  const [edit,setEdit]=useState<Record<number,{name:string;description:string;price:string;category:string}>>({});
  const fileRef=useRef<HTMLInputElement>(null);

  async function load(){
    const x=await fetch('/api/admin/menu');
    if(x.status===401){router.push('/admin/login');return}
    const j=await x.json();if(!x.ok)return setErr(j.error||'Could not load menu');
    setItems(j.items||[]);
  }
  useEffect(()=>{load()},[]);

  async function call(method:string,body:any){
    setMsg('');setErr('');
    const x=await fetch('/api/admin/menu',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const j=await x.json();
    if(!x.ok){setErr(j.error||'Something went wrong');return false}
    return true;
  }
  async function pick(file:File|undefined,cb:(data:string)=>void){
    if(!file)return;setErr('');
    try{cb(await shrink(file))}catch{setErr('That file could not be read as an image.')}
  }
  async function add(){
    if(await call('POST',{name:n,description:d,price:p,category:c,image:img})){
      setN('');setD('');setP('');setC('');setImg(null);if(fileRef.current)fileRef.current.value='';setMsg('Item added.');load();
    }
  }
  async function save(i:Item){
    const e=edit[i.id];if(!e)return;
    if(await call('PATCH',{id:i.id,...e})){setEdit(x=>{const y={...x};delete y[i.id];return y});setMsg('Saved.');load()}
  }
  async function setImage(i:Item,data:string|null){if(await call('PATCH',{id:i.id,image:data})){setMsg(data?'Image updated.':'Image removed.');load()}}
  async function toggle(i:Item){if(await call('PATCH',{id:i.id,available:!i.available}))load()}
  async function del(i:Item){if(!confirm('Delete '+i.name+' from the menu?'))return;if(await call('DELETE',{}))load()}

  return <main className="wrap">
    <div className="hero"><h1>Menu</h1><p>These items show on the customer menu page. Add a photo to any item, or leave it blank.</p></div>
    {msg&&<div className="success">{msg}</div>}{err&&<div className="error">{err}</div>}
    <div className="card">
      <h2>Add menu item</h2>
      <div className="field"><label>Name</label><input value={n} onChange={e=>setN(e.target.value)}/></div>
      <div className="field"><label>Description (optional)</label><input value={d} onChange={e=>setD(e.target.value)}/></div>
      <div className="field"><label>Price (R)</label><input type="number" min="0" step="0.01" value={p} onChange={e=>setP(e.target.value)}/></div>
      <div className="field"><label>Category (optional, e.g. Burgers, Sides, Drinks)</label><input value={c} onChange={e=>setC(e.target.value)}/></div>
      <div className="field"><label>Photo (optional)</label>
        <input ref={fileRef} type="file" accept="image/*" onChange={e=>pick(e.target.files?.[0],setImg)}/>
        {img&&<div className="thumb-row"><img className="thumb" src={img} alt="Preview"/><button className="secondary" onClick={()=>{setImg(null);if(fileRef.current)fileRef.current.value=''}}>Remove photo</button></div>}
      </div>
      <button className="primary" onClick={add}>Add to menu</button>
    </div>
    <h2 style={{marginTop:28}}>Current items</h2>
    <div className="admin-menu-list">
      {items.map(i=>{const e=edit[i.id];const v=e||{name:i.name,description:i.description,price:(i.price_cents/100).toFixed(2),category:i.category};
        const set=(k:string,val:string)=>setEdit(x=>({...x,[i.id]:{...v,[k]:val}}));
        return <div className={'card admin-menu-item'+(i.available?'':' is-off')} key={i.id}>
          <div className="admin-menu-pic">{i.image?<img className="thumb" src={i.image} alt={i.name}/>:<div className="thumb menu-ph"><span>{i.name.charAt(0).toUpperCase()}</span></div>}
            <label className="secondary file-btn">{i.image?'Change photo':'Add photo'}<input type="file" accept="image/*" hidden onChange={ev=>pick(ev.target.files?.[0],data=>setImage(i,data))}/></label>
            {i.image&&<button className="secondary" onClick={()=>setImage(i,null)}>Remove photo</button>}
          </div>
          <div className="admin-menu-fields">
            <div className="field"><label>Name</label><input value={v.name} onChange={ev=>set('name',ev.target.value)}/></div>
            <div className="field"><label>Description</label><input value={v.description} onChange={ev=>set('description',ev.target.value)}/></div>
            <div className="two-col"><div className="field"><label>Price (R)</label><input type="number" min="0" step="0.01" value={v.price} onChange={ev=>set('price',ev.target.value)}/></div>
              <div className="field"><label>Category</label><input value={v.category} onChange={ev=>set('category',ev.target.value)}/></div></div>
            <div className="links"><button className="primary inline-btn" disabled={!e} onClick={()=>save(i)}>Save changes</button>
              <button className="secondary" onClick={()=>toggle(i)}>{i.available?'Hide from menu':'Show on menu'}</button>
              <button className="danger" onClick={()=>del(i)}>Delete</button></div>
          </div>
        </div>})}
      {!items.length&&<div className="card muted">No menu items yet.</div>}
    </div>
    <div className="links" style={{marginTop:20}}><Link href="/admin">Back to admin home</Link></div>
  </main>;
}
