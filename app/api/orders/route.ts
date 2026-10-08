import {NextRequest,NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';
import {getSessionUserId} from '@/lib/auth';
import {error} from '@/lib/http';

const DELIVERY_FEE=2500;
const makeOrderNo=()=>\`FZ-\${Date.now().toString(36).toUpperCase()}-\${Math.random().toString(36).slice(2,6).toUpperCase()}\`;

export async function GET(){
  const userId=await getSessionUserId();
  if(!userId)return error('Login required',401);
  await initDb();
  const orders=await sql\`SELECT id,order_number,order_type,payment_method,status,subtotal_cents,delivery_fee_cents,total_cents,points_awarded,customer_name,customer_phone,delivery_address,notes,created_at,updated_at FROM orders WHERE user_id=\${userId} ORDER BY created_at DESC LIMIT 50\`;
  return NextResponse.json({orders});
}

export async function POST(req:NextRequest){
  const userId=await getSessionUserId();
  if(!userId)return error('Please log in before placing an order.',401);
  await initDb();
  const b=await req.json();
  const raw=Array.isArray(b.items)?b.items:[]; const orderType=b.orderType==='delivery'?'delivery':'pickup';
  const payment=b.paymentMethod==='card'?'card':'cash';
  const name=String(b.customerName||'').trim().slice(0,100);
  const phone=String(b.customerPhone||'').trim().slice(0,40);
  const address=String(b.deliveryAddress||'').trim().slice(0,300);
  const notes=String(b.notes||'').trim().slice(0,500);
  if(!name||!phone)return error('Name and phone number are required.');
  if(orderType==='delivery'&&!address)return error('Delivery address is required.');
  if(!raw.length)return error('Your cart is empty.');
  const ids=[...new Set(raw.map((x:any)=>Number(x.id)).filter((x:number)=>Number.isInteger(x)&&x>0))];
  if(!ids.length)return error('Your cart is empty.');
  const rows=await sql\`SELECT id,name,price_cents FROM menu_items WHERE available=true AND id=ANY(\${ids}::int[])\`;
  const byId=new Map(rows.map((x:any)=>[Number(x.id),x]));
  const items:any[]=[]; let subtotal=0;
  for(const x of raw){
    const id=Number(x.id), qty=Math.max(1,Math.min(20,Number(x.quantity)||1)), item=byId.get(id);
    if(!item)continue;
    const line=item.price_cents*qty; subtotal+=line;
    items.push({id,name:item.name,price_cents:item.price_cents,quantity:qty,line_total_cents:line});
  }
  if(!items.length)return error('None of the items in your cart are currently available.');
  const fee=orderType==='delivery'?DELIVERY_FEE:0, total=subtotal+fee, orderNo=makeOrderNo();
  try{
    const created=await sql\`INSERT INTO orders(order_number,user_id,order_type,payment_method,subtotal_cents,delivery_fee_cents,total_cents,customer_name,customer_phone,delivery_address,notes) VALUES(\${orderNo},\${userId},\${orderType},\${payment},\${subtotal},\${fee},\${total},\${name},\${phone},\${address},\${notes}) RETURNING id,order_number\`;
    const orderId=created[0].id;
    for(const x of items) await sql\`INSERT INTO order_items(order_id,menu_item_id,name,price_cents,quantity,line_total_cents) VALUES(\${orderId},\${x.id},\${x.name},\${x.price_cents},\${x.quantity},\${x.line_total_cents})\`;
    return NextResponse.json({ok:true,orderId,orderNumber:orderNo,totalCents:total});
  }catch{return error('We could not place your order. Please try again.',500)}
}