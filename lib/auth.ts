import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
const secret = new TextEncoder().encode((()=>{const s=process.env.JWT_SECRET;if(!s&&process.env.NODE_ENV==='production'&&process.env.NEXT_PHASE!=='phase-production-build')throw new Error('JWT_SECRET is not set');return s||'dev-only-secret'})());
export async function setSession(userId:number){ const token=await new SignJWT({userId}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret); (await cookies()).set('fz_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:60*60*24*7}); }
export async function getSessionUserId(){ try{ const token=(await cookies()).get('fz_session')?.value; if(!token)return null; const {payload}=await jwtVerify(token,secret); return Number(payload.userId)||null;}catch{return null;} }
export async function clearSession(){(await cookies()).delete('fz_session');}
