import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {error} from '@/lib/http';
import {requireAdmin} from '@/lib/adminAuth';

export async function GET(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const q=(new URL(req.url).searchParams.get('q')||'').trim();
  const rows=q
    ? await sql`SELECT id,member_id,name,email,points,created_at FROM users WHERE role='customer' AND (name ILIKE ${'%'+q+'%'} OR email ILIKE ${'%'+q+'%'} OR member_id ILIKE ${'%'+q+'%'}) ORDER BY created_at DESC LIMIT 100`
    : await sql`SELECT id,member_id,name,email,points,created_at FROM users WHERE role='customer' ORDER BY created_at DESC LIMIT 100`;
  return NextResponse.json({customers:rows});
}

export async function PATCH(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const {id,points}=await req.json();
  if(!id||!Number.isFinite(Number(points))||Number(points)<0)return error('A customer id and a valid non-negative points value are required.');
  const rows=await sql`UPDATE users SET points=${Math.floor(Number(points))} WHERE id=${Number(id)} AND role='customer' RETURNING id,member_id,name,email,points`;
  if(!rows.length)return error('Customer not found',404);
  return NextResponse.json({ok:true,customer:rows[0]});
}

export async function DELETE(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const id=new URL(req.url).searchParams.get('id');
  if(!id)return error('Missing id');
  const rows=await sql`DELETE FROM users WHERE id=${Number(id)} AND role='customer' RETURNING id`;
  if(!rows.length)return error('Customer not found',404);
  return NextResponse.json({ok:true});
}
