import {NextResponse} from 'next/server';
// Redemption is staff-only (Admin > Scan customer QR). Customers can't spend points directly.
export async function POST(){return NextResponse.json({error:'Please show your QR code to staff to redeem a reward.'},{status:403})}
