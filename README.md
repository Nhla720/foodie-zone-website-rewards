# Foodie Zone Website + Rewards

This is the **full Foodie Zone customer website** with the Foodie Zone Rewards program built into the same project.

## Customer side
- Foodie Zone branded homepage
- Menu (display only — every order goes through Foodie Zone ordering via the Order Online button; items, prices and photos are managed in Admin → Menu)
- Contact
- Customer registration/login
- Rewards landing page
- Customer dashboard with name, member ID, points, QR code and a progress bar to the next reward
- "Claim my order" for online orders (staff approve in Admin → Order claims before points are added)
- Installable as an app (PWA): Add to Home Screen / Install
- Purchase history
- Rewards
- Password recovery
- Order Online button connected to the existing Foodie Zone ordering ordering page

## Rewards/admin side
The project also contains the Rewards API and admin area for customer management, purchases, rewards, staff and QR redemption.

## Shared Rewards rules
Points are calculated as **25% of the purchase amount**, represented as whole points. Examples: R100 = 25 points, R200 = 50 points.

Because Foodie Zone ordering has not provided an API/webhook, do not scrape or bypass it. Online purchases can be recorded for admin verification until an official integration is available.

## Environment
Copy `.env.example` to `.env.local` and configure Neon, JWT, Resend, admin and the Foodie Zone ordering URL.

## Run
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`.

## Deployment
This project can be deployed as the main Foodie Zone website. It is intentionally separate from the Rewards-only project. Both can use the same Neon database only if you configure them against the same database schema and coordinate authentication/data migrations.
