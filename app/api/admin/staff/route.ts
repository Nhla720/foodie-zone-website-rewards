import {NextRequest,NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import sql,{initDb} from '@/lib/db';
import {currentAdminId} from '@/lib/adminAuth';
import {error} from '@/lib/http';
import {isValidEmail,validatePassword} from '@/lib/validation';

export async function GET(req:NextRequest){
  if(!(await currentAdminId(req)))return error('Admin access required',401);
  await initDb();
  const rows=await sql`SELECT id,name,email,created_at FROM users WHERE role='admin' ORDER BY created_at ASC`;
  return NextResponse.json({admins:rows});
}

export async function POST(req:NextRequest){
  if(!(await currentAdminId(req)))return error('Admin access required',401);
  await initDb();
  const {name,email,password}=await req.json();
  if(!name||!String(name).trim())return error('Enter a name.');
  if(!email||!isValidEmail(email))return error('Enter a valid email address.');
  const check=validatePassword(password);
  if(!check.ok)return error(check.message);
  const exists=await sql`SELECT id FROM users WHERE lower(email)=lower(${email})`;
  if(exists.length)return error('An account with that email already exists.');
  const memberId='FZR-'+Math.random().toString(36).slice(2,8).toUpperCase();
  const hash=await bcrypt.hash(password,12);
  const rows=await sql`INSERT INTO users(member_id,name,email,password_hash,must_upgrade_password,role) VALUES(${memberId},${String(name).trim()},${String(email).toLowerCase().trim()},${hash},false,'admin') RETURNING id,name,email,created_at`;
  return NextResponse.json({ok:true,admin:rows[0]});
}

export async function DELETE(req:NextRequest){
  const actingId=await currentAdminId(req);
  if(!actingId)return error('Admin access required',401);
  await initDb();
  const id=Number(new URL(req.url).searchParams.get('id'));
  if(!id)return error('Missing id');
  if(id===actingId)return error("You can't remove your own admin access.");
  const admins=await sql`SELECT id FROM users WHERE role='admin'`;
  if(admins.length<=1)return error('At least one admin account must remain.');
  const rows=await sql`UPDATE users SET role='customer' WHERE id=${id} AND role='admin' RETURNING id`;
  if(!rows.length)return error('Admin not found');
  return NextResponse.json({ok:true});
}
