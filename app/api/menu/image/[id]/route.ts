import sql,{initDb} from '@/lib/db';

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const n=Number(id);
  if(!Number.isInteger(n))return new Response('Not found',{status:404});
  await initDb();
  const rows=await sql`SELECT image_data FROM menu_items WHERE id=${n}`;
  const data:string|null=rows[0]?.image_data||null;
  const m=data&&/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(data);
  if(!m)return new Response('Not found',{status:404});
  return new Response(Buffer.from(m[2],'base64'),{headers:{'Content-Type':m[1],'Cache-Control':'public, max-age=86400, immutable'}});
}
