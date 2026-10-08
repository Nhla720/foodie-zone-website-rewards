import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {requireAdmin} from '@/lib/adminAuth';
import {pointsForCents} from '@/lib/points';
import {error} from '@/lib/http';

export async function GET(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const orders=await sql`SELECT o.*,u.member_id,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY (o.status='New') DESC,o.created_at DESC LIMIT 200`;
  return NextResponse.json({orders});
}
export async function PATCH(req:NextRequest){
  if(!(await requireAdmin(req)))return error('Admin access required',401);
  await initDb();
  const b=await req.json(), id=Number(b.id), status=String(b.status||'');
  if(!Number.isInteger(id)||!['New','Preparing','Ready','Completed','Cancelled'].includes(status))return error('Invalid order update.');
  const current=await sql`SELECT id,status,total_cents,points_awarded,user_id,order_number FROM orders WHERE id=${id}`;
  if(!current.length)return error('Order not found.',404);
  if(current[0].status==='Cancelled'&&status!=='Cancelled')return error('Cancelled orders cannot be reopened.');
  if(current[0].status==='Completed'&&status!=='Completed')return error('Completed orders cannot be moved backwards.');
  const wasCompleted=current[0].status==='Completed';
  const points=pointsForCents(Number(current[0].total_cents));
  const updated=await sql`UPDATE orders SET status=${status},updated_at=NOW(),points_awarded=CASE WHEN ${status}='Completed' AND status<>'Completed' THEN ${points} ELSE points_awarded END WHERE id=${id} RETURNING *`;
  const row=updated[0];
  if(!wasCompleted&&status==='Completed'&&Number(row.points_awarded)>0){
    await sql`UPDATE users SET points=points+${Number(row.points_awarded)} WHERE id=${row.user_id}`;
    await sql`INSERT INTO purchases(user_id,member_id,external_order_id,source,amount_cents,points_earned) SELECT ${row.user_id},member_id,${row.order_number},'online',${row.total_cents},${row.points_awarded} FROM users WHERE id=${row.user_id} ON CONFLICT DO NOTHING`;
  }
  return NextResponse.json({ok:true,pointsAdded:!wasCompleted&&status==='Completed'?Number(row.points_awarded):0});
}