import {NextRequest,NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';
import sql,{initDb} from '@/lib/db';
import {getSessionUserId} from '@/lib/auth';
import {error} from '@/lib/http';
import {validatePassword} from '@/lib/validation';

export async function POST(req:NextRequest){
  const id=await getSessionUserId();
  if(!id)return error('Unauthorized',401);
  await initDb();
  const {currentPassword,newPassword}=await req.json();
  if(!currentPassword)return error('Enter your current password.');
  const check=validatePassword(newPassword);
  if(!check.ok)return error(check.message);
  const rows=await sql`SELECT password_hash FROM users WHERE id=${id}`;
  if(!rows.length||!(await bcrypt.compare(String(currentPassword),rows[0].password_hash)))return error('Current password is incorrect.',401);
  const hash=await bcrypt.hash(String(newPassword),12);
  await sql`UPDATE users SET password_hash=${hash},must_upgrade_password=false WHERE id=${id}`;
  return NextResponse.json({message:'Password updated.'});
}
