import {NextRequest,NextResponse} from 'next/server';
import {initDb} from '@/lib/db';
import {currentAdminId} from '@/lib/adminAuth';
import {error} from '@/lib/http';

export async function GET(req:NextRequest){
  await initDb();
  const id=await currentAdminId(req);
  if(!id)return error('Not logged in as admin',401);
  return NextResponse.json({ok:true});
}
