import { NextRequest } from 'next/server';
import sql from './db';
import { getSessionUserId } from './auth';

// Primary path: a logged-in user whose role is 'admin' (see /admin/login).
// Legacy fallback: the old shared x-admin-key header, kept so any existing
// scripts/integrations built against it keep working. New admin work in the
// UI no longer uses it.
export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const legacyKey = req.headers.get('x-admin-key');
  if (legacyKey && process.env.ADMIN_KEY && legacyKey === process.env.ADMIN_KEY) return true;
  const id = await getSessionUserId();
  if (!id) return false;
  const rows = await sql`SELECT role FROM users WHERE id=${id}`;
  return rows.length > 0 && rows[0].role === 'admin';
}

export async function currentAdminId(req: NextRequest): Promise<number | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  const rows = await sql`SELECT id,role FROM users WHERE id=${id}`;
  if (!rows.length || rows[0].role !== 'admin') return null;
  return id;
}
