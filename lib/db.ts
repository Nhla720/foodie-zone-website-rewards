import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { MENU_SEED } from './menuSeed';
const sql = neon(process.env.DATABASE_URL!);
async function runInit(){
 await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, member_id VARCHAR(32) UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, points INTEGER NOT NULL DEFAULT 0, must_upgrade_password BOOLEAN NOT NULL DEFAULT TRUE, role VARCHAR(20) NOT NULL DEFAULT 'customer', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 // Migration for databases created before the password-strength rules existed: flag every
 // pre-existing account so they're asked to set a stronger password on next login. New accounts
 // explicitly set this to FALSE at insert time (see register/reset-password/change-password), so
 // the DEFAULT TRUE here only ever affects rows that already existed before this column did.
 await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_upgrade_password BOOLEAN NOT NULL DEFAULT TRUE`;
 // Migration for the shared-admin-key -> per-admin-account switch. Existing rows default to
 // 'customer'; nothing is auto-promoted. Use ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD (below) to
 // create the first admin account, or promote an existing user from the Staff accounts page.
 await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'customer'`;
 await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash VARCHAR(64) UNIQUE NOT NULL, expires_at TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ)`;
 await sql`CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id)`;
 await sql`CREATE TABLE IF NOT EXISTS rewards (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT DEFAULT '', points_cost INTEGER NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 await sql`CREATE TABLE IF NOT EXISTS redemptions (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, reward_id INTEGER NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT, points_cost INTEGER NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 await sql`CREATE TABLE IF NOT EXISTS purchases (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, member_id VARCHAR(32), external_order_id TEXT, source VARCHAR(20) NOT NULL CHECK (source IN ('online','store','manual')), amount_cents INTEGER NOT NULL, points_earned INTEGER NOT NULL DEFAULT 0, status VARCHAR(20) NOT NULL DEFAULT 'completed', purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(source, external_order_id))`;
  await sql`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY)`;
 await sql`CREATE TABLE IF NOT EXISTS menu_items (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price_cents INTEGER NOT NULL, category TEXT NOT NULL DEFAULT 'Menu', image_data TEXT, available BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
 // Seed the existing menu exactly once (never again, even if every item is later deleted).
 const seeded=await sql`INSERT INTO app_meta(key) VALUES('menu_seeded') ON CONFLICT DO NOTHING RETURNING key`;
 if(seeded.length){
   const count=await sql`SELECT count(*)::int AS n FROM menu_items`;
   if(count[0].n===0){
     for(let i=0;i<MENU_SEED.length;i++){const x=MENU_SEED[i];await sql`INSERT INTO menu_items(name,description,price_cents,category,sort_order) VALUES(${x.name},${x.description},${x.price_cents},${x.category},${i})`;}
   }
 }
 await sql`CREATE TABLE IF NOT EXISTS order_claims (id SERIAL PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, order_ref TEXT NOT NULL, amount_cents INTEGER NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')), points_awarded INTEGER NOT NULL DEFAULT 0, admin_note TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), reviewed_at TIMESTAMPTZ)`;
 await sql`CREATE UNIQUE INDEX IF NOT EXISTS order_claims_ref_active_idx ON order_claims (lower(order_ref)) WHERE status <> 'rejected'`;
 await sql`CREATE INDEX IF NOT EXISTS order_claims_user_idx ON order_claims(user_id)`;
 // Optional one-time bootstrap for the very first admin account, so there's a way in
 // before any admin exists. Set ADMIN_SEED_EMAIL/ADMIN_SEED_PASSWORD, log in once at
 // /admin/login, then remove the env vars (or leave them — this only ever creates the
 // account once; it never overwrites an existing user).
 const seedEmail=process.env.ADMIN_SEED_EMAIL,seedPassword=process.env.ADMIN_SEED_PASSWORD;
 if(seedEmail&&seedPassword){
   const exists=await sql`SELECT id FROM users WHERE lower(email)=lower(${seedEmail})`;
   if(!exists.length){
     const memberId='FZR-'+Math.random().toString(36).slice(2,8).toUpperCase();
     const hash=await bcrypt.hash(seedPassword,12);
     await sql`INSERT INTO users(member_id,name,email,password_hash,must_upgrade_password,role) VALUES(${memberId},'Admin',${seedEmail.toLowerCase().trim()},${hash},false,'admin')`;
   }
 }
}
// Schema setup runs once per warm server instance instead of on every request.
let ready:Promise<void>|null=null;
export function initDb():Promise<void>{
 if(!ready) ready=runInit().catch(e=>{ready=null;throw e});
 return ready;
}
export default sql;

