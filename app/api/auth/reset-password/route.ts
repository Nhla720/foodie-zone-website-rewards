import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import sql, { initDb } from '../../../../lib/db';
import { validatePassword } from '../../../../lib/validation';

export async function POST(req: Request) {
  try {
    await initDb();
    const { token, password } = await req.json();
    const rawToken = String(token || ''), newPassword = String(password || '');
    if (!rawToken) return NextResponse.json({ error: 'This reset link is missing or invalid.' }, { status: 400 });
    const check = validatePassword(newPassword);
    if (!check.ok) return NextResponse.json({ error: check.message }, { status: 400 });
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const rows = await sql`SELECT id, user_id FROM password_reset_tokens WHERE token_hash = ${tokenHash} AND expires_at > NOW() AND used_at IS NULL LIMIT 1`;
    if (!rows.length) return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await sql`UPDATE users SET password_hash = ${passwordHash}, must_upgrade_password = false WHERE id = ${rows[0].user_id}`;
    await sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${rows[0].id}`;
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${rows[0].user_id} AND id <> ${rows[0].id}`;
    return NextResponse.json({ message: 'Password updated successfully.' });
  } catch (error) { console.error(error); return NextResponse.json({ error: 'Unable to reset the password right now.' }, { status: 500 }); }
}
