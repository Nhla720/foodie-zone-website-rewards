import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {getSessionUserId} from '@/lib/auth';
import {error} from '@/lib/http';
import {rateLimit,rateLimitMessage} from '@/lib/rateLimit';

// Customer: list my recent claims
export async function GET(){
  const uid=await getSessionUserId();
  if(!uid)return error('Unauthorized',401);
  await initDb();
  const claims=await sql`SELECT id,order_ref,amount_cents,status,points_awarded,admin_note,created_at FROM order_claims WHERE user_id=${uid} ORDER BY created_at DESC LIMIT 10`;
  return NextResponse.json({claims});
}

// Customer: "claim my online order" — staff verify it against FoodBooking before points are added.
export async function POST(req:NextRequest){
  const uid=await getSessionUserId();
  if(!uid)return error('Unauthorized',401);
  const rl=rateLimit('claim:'+uid,10,60*60*1000);
  if(!rl.allowed)return error(rateLimitMessage(rl.retryAfterSeconds),429);
  await initDb();
  const b=await req.json().catch(()=>({}));
  const orderRef=String(b.orderRef||'').trim();
  const cents=Math.round(Number(b.amount)*100);
  if(orderRef.length<3||orderRef.length>40||!/^[A-Za-z0-9#\-_ ]+$/.test(orderRef))return error('Enter your order number exactly as it appears on your FoodBooking confirmation (letters, numbers and dashes only).');
  if(!Number.isFinite(cents)||cents<=0||cents>1_000_000)return error('Enter the total you paid, in rand.');
  const pending=await sql`SELECT count(*)::int AS n FROM order_claims WHERE user_id=${uid} AND status='pending'`;
  if(pending[0].n>=5)return error('You already have 5 claims waiting for review. Please wait for staff to check them first.');
  const dup=await sql`SELECT 1 FROM purchases WHERE source='online' AND lower(external_order_id)=lower(${orderRef})`;
  if(dup.length)return error('That order has already been recorded and its points added.',409);
  try{
    await sql`INSERT INTO order_claims(user_id,order_ref,amount_cents) VALUES(${uid},${orderRef},${cents})`;
  }catch{
    return error('That order number has already been submitted.',409);
  }
  return NextResponse.json({ok:true});
}
