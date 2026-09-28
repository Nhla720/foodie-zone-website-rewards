import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {error} from '@/lib/http';
import {requireAdmin} from '@/lib/adminAuth';
import {pointsForCents} from '@/lib/points';

export async function GET(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const claims=await sql`SELECT c.id,c.order_ref,c.amount_cents,c.status,c.points_awarded,c.admin_note,c.created_at,c.reviewed_at,u.name,u.member_id,u.email FROM order_claims c JOIN users u ON u.id=c.user_id ORDER BY (c.status='pending') DESC,c.created_at DESC LIMIT 150`;
  return NextResponse.json({claims});
}

// Approve (optionally correcting the amount to what FoodBooking shows) or reject a claim.
export async function PATCH(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const b=await req.json();
  const id=Number(b.id);
  const note=String(b.note||'').trim().slice(0,200);
  if(!Number.isInteger(id))return error('Missing claim id');

  if(b.action==='reject'){
    const rows=await sql`UPDATE order_claims SET status='rejected',admin_note=${note},reviewed_at=NOW() WHERE id=${id} AND status='pending' RETURNING id`;
    if(!rows.length)return error('That claim was already reviewed.',409);
    return NextResponse.json({ok:true});
  }
  if(b.action!=='approve')return error('Unknown action');

  const cents=Math.round(Number(b.amount)*100);
  if(!Number.isFinite(cents)||cents<=0)return error('Enter the confirmed order amount.');
  const pts=pointsForCents(cents);
  try{
    // One statement = all-or-nothing: mark approved, record the purchase, add the points.
    const r=await sql`WITH c AS (UPDATE order_claims SET status='approved',amount_cents=${cents}::int,points_awarded=${pts}::int,admin_note=${note},reviewed_at=NOW() WHERE id=${id} AND status='pending' RETURNING user_id,order_ref),
      p AS (INSERT INTO purchases(user_id,member_id,external_order_id,source,amount_cents,points_earned) SELECT c.user_id,u.member_id,c.order_ref,'online',${cents}::int,${pts}::int FROM c JOIN users u ON u.id=c.user_id RETURNING id),
      g AS (UPDATE users SET points=points+${pts}::int WHERE id IN (SELECT user_id FROM c) RETURNING id)
      SELECT (SELECT count(*) FROM c)::int AS claimed`;
    if(!r[0].claimed)return error('That claim was already reviewed.',409);
    return NextResponse.json({ok:true,pointsAdded:pts});
  }catch{
    return error('An online purchase with this order number is already recorded, so points were not added again. Reject this claim instead.',409);
  }
}
