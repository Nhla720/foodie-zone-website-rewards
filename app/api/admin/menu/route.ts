import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {error} from '@/lib/http';
import {requireAdmin} from '@/lib/adminAuth';

const MAX_IMAGE_CHARS=700_000; // the admin page shrinks photos to ~100-200 KB before upload
const okImage=(s:unknown)=>typeof s==='string'&&s.length<=MAX_IMAGE_CHARS&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(s);
const toCents=(v:unknown)=>{const n=Math.round(Number(v)*100);return Number.isFinite(n)&&n>=0&&n<=10_000_000?n:null};

export async function GET(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const rows=await sql`SELECT id,name,description,price_cents,category,available,sort_order,(image_data IS NOT NULL) AS has_image,EXTRACT(EPOCH FROM updated_at)::bigint AS v FROM menu_items ORDER BY sort_order,id`;
  return NextResponse.json({items:rows.map((r:any)=>({...r,image:r.has_image?`/api/menu/image/${r.id}?v=${r.v}`:null}))});
}

export async function POST(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const b=await req.json();
  const name=String(b.name||'').trim();
  const cents=toCents(b.price);
  if(!name||cents===null)return error('A name and a valid price are required.');
  if(b.image&&!okImage(b.image))return error('That image is not supported or is too large. Use a JPG, PNG or WebP photo.');
  const category=String(b.category||'').trim()||'Menu';
  const next=await sql`SELECT COALESCE(MAX(sort_order),-1)+1 AS n FROM menu_items`;
  const rows=await sql`INSERT INTO menu_items(name,description,price_cents,category,image_data,available,sort_order) VALUES(${name},${String(b.description||'').trim()},${cents},${category},${b.image||null},${b.available!==false},${next[0].n}) RETURNING id`;
  return NextResponse.json({ok:true,id:rows[0].id});
}

// Partial update: send only what changed. image: data URL to set, null to remove, omit to keep.
export async function PATCH(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const b=await req.json();
  const id=Number(b.id);
  if(!Number.isInteger(id))return error('Missing id');
  const cur=await sql`SELECT id,name,description,price_cents,category,available,image_data FROM menu_items WHERE id=${id}`;
  if(!cur.length)return error('Item not found',404);
  const c=cur[0];
  const name=b.name!==undefined?String(b.name).trim():c.name;
  const description=b.description!==undefined?String(b.description).trim():c.description;
  const category=b.category!==undefined?(String(b.category).trim()||'Menu'):c.category;
  const cents=b.price!==undefined?toCents(b.price):c.price_cents;
  const available=b.available!==undefined?!!b.available:c.available;
  if(!name||cents===null)return error('A name and a valid price are required.');
  let image=c.image_data as string|null;
  if(b.image===null)image=null;
  else if(b.image!==undefined){if(!okImage(b.image))return error('That image is not supported or is too large. Use a JPG, PNG or WebP photo.');image=b.image}
  await sql`UPDATE menu_items SET name=${name},description=${description},category=${category},price_cents=${cents},available=${available},image_data=${image},updated_at=NOW() WHERE id=${id}`;
  return NextResponse.json({ok:true});
}

export async function DELETE(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const id=Number(new URL(req.url).searchParams.get('id'));
  if(!Number.isInteger(id))return error('Missing id');
  await sql`DELETE FROM menu_items WHERE id=${id}`;
  return NextResponse.json({ok:true});
}
