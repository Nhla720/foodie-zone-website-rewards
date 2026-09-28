import { NextResponse } from 'next/server';
export function error(message:string,status=400){return NextResponse.json({error:message},{status});}
