import { NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import sql, { initDb } from '../../../../lib/db';
import { sendPasswordResetEmail } from '../../../../lib/email';
import { rateLimit, rateLimitMessage, clientIp } from '../../../../lib/rateLimit';

export async function POST(req: Request) {
  try {
    await initDb();
    const { email } = await req.json();
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    const rl = rateLimit(`forgot-password:${clientIp(req)}:${normalized}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) return NextResponse.json({ error: rateLimitMessage(rl.retryAfterSeconds) }, { status: 429 });
    const users = await sql`SELECT id, name, email FROM users WHERE LOWER(email) = ${normalized} LIMIT 1`;
    if (!users.length) return NextResponse.json({ message: 'If an account exists for that email, a reset link has been sent.' });
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${users[0].id} OR expires_at < NOW()`;
    await sql`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (${users[0].id}, ${tokenHash}, NOW() + INTERVAL '30 minutes')`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    await sendPasswordResetEmail(String(users[0].name), String(users[0].email), `${appUrl}/reset-password?token=${rawToken}`);
    return NextResponse.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to process the request right now.' }, { status: 500 }); }
}
