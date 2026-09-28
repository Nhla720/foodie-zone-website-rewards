import {NextRequest,NextResponse} from 'next/server';import sql,{initDb} from '@/lib/db';import {getSessionUserId} from '@/lib/auth';import {error} from '@/lib/http';

export async function GET(){const id=await getSessionUserId();if(!id)return NextResponse.json({error:'Unauthorized'},{status:401});await initDb();const rows=await sql`SELECT id,member_id,name,email,points,must_upgrade_password FROM users WHERE id=${id}`;if(!rows.length)return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({user:rows[0]})}

export async function PATCH(req:NextRequest){
  const id=await getSessionUserId();
  if(!id)return error('Unauthorized',401);
  await initDb();
  const {name,email}=await req.json();
  const cleanName=String(name||'').trim();
  const cleanEmail=String(email||'').trim().toLowerCase();
  if(!cleanName||!cleanEmail)return error('Name and email are required.');
  const taken=await sql`SELECT id FROM users WHERE lower(email)=${cleanEmail} AND id<>${id}`;
  if(taken.length)return error('That email is already in use by another account.');
  const rows=await sql`UPDATE users SET name=${cleanName},email=${cleanEmail} WHERE id=${id} RETURNING id,member_id,name,email,points`;
  return NextResponse.json({user:rows[0]});
}
