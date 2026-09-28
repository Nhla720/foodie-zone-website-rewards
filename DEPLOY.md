# Deploying Foodie Zone (GitHub -> Vercel + Neon + Resend)

## 1. Environment variables (Vercel -> Project -> Settings -> Environment Variables)
| Name | Value |
|---|---|
| DATABASE_URL | Neon connection string (use the pooled one) |
| JWT_SECRET | long random string (generate below) |
| RESEND_API_KEY | from resend.com -> API Keys |
| EMAIL_FROM | `Foodie Zone <no-reply@yourdomain>` once your domain is verified |
| NEXT_PUBLIC_APP_URL | your live URL, e.g. https://rewards-foodie-zone.vercel.app |
| NEXT_PUBLIC_ORDER_ONLINE_URL | your FoodBooking ordering link |
| ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD | first admin login (remove after first login) |
| PURCHASE_WEBHOOK_KEY | long random string (only needed for automatic purchase imports) |

Leave ADMIN_KEY unset. NEXT_PUBLIC_* values are baked in at build time, so redeploy after changing them.

Generate a secret in PowerShell:
`$b=New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)`

## 2. Database
Nothing to run by hand. Tables are created automatically on the first request.

## 3. After deploying
1. /admin/login with the seed account, then delete ADMIN_SEED_* in Vercel.
2. Admin -> Menu: check items, add photos.
3. Register a test customer; try Forgot password (email must arrive).
4. Add a store purchase in Admin -> Purchases; check points (25%).
5. Submit a test claim as the customer; approve it in Admin -> Order claims.
6. Open on a phone and install to the home screen.
