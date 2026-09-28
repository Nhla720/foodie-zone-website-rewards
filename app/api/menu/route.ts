import {NextResponse} from 'next/server';
import sql,{initDb} from '@/lib/db';

// Public: the menu customers see. Images are served separately (/api/menu/image/:id) so this stays small.
export async function GET(){
  await initDb();
  const rows=await sql`SELECT id,name,description,price_cents,category,(image_data IS NOT NULL) AS has_image,EXTRACT(EPOCH FROM updated_at)::bigint AS v FROM menu_items WHERE available=true ORDER BY sort_order,id`;
  const items=rows.map((r:any)=>({id:r.id,name:r.name,description:r.description,price_cents:r.price_cents,category:r.category,image:r.has_image?`/api/menu/image/${r.id}?v=${r.v}`:null}));
  return NextResponse.json({items},{headers:{'Cache-Control':'public, max-age=0, s-maxage=30, stale-while-revalidate=120'}});
}
