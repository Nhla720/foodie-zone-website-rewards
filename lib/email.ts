import { Resend } from 'resend';

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const FROM = () => process.env.EMAIL_FROM || 'Foodie Zone <onboarding@resend.dev>';

// Resend returns { error } instead of throwing, so log it — otherwise a bad API key or an
// unverified sending domain fails silently and customers just never get the email.
async function send(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) { console.warn('RESEND_API_KEY not set — email skipped:', subject); return { skipped: true }; }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const res = await resend.emails.send({ from: FROM(), to, subject, html });
  if (res.error) console.error('Resend error:', res.error);
  return res;
}

export async function sendWelcomeEmail(name: string, email: string, memberId: string) {
  return send(email, 'Welcome to Foodie Zone Rewards', `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Welcome to Foodie Zone, ${esc(name)}!</h2><p>Thanks for choosing Foodie Zone and joining our Rewards programme.</p><p>Your member ID is <strong>${esc(memberId)}</strong>.</p><p>You can log in anytime to view your points, member ID and reward QR code.</p><p>Enjoy your next Foodie Zone meal.</p></div>`);
}

export async function sendPasswordResetEmail(name: string, email: string, resetUrl: string) {
  return send(email, 'Reset your Foodie Zone Rewards password', `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#1A1A1A"><h2 style="color:#E8184A">Reset your password</h2><p>Hi ${esc(name)},</p><p>We received a request to reset your Foodie Zone Rewards password.</p><p><a href="${esc(resetUrl)}" style="display:inline-block;background:#E8184A;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;font-weight:700">Reset password</a></p><p>This link expires in 30 minutes and can only be used once.</p><p>If you did not request this, you can safely ignore this email.</p></div>`);
}
