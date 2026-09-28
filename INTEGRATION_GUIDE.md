# Foodie Zone Rewards — Purchase Integration Guide

## Goal
Connect purchases from the existing Foodie Zone ordering/POS system to the new Rewards app without requiring its frontend/source code.

## What the Rewards app needs from the external system
For every completed purchase, send:
- `memberId` or the customer's rewards email
- `amount`
- `source`: `online` or `store`
- `externalOrderId`: unique order/receipt ID
- `status`: normally `completed`
- optional `purchasedAt`

### Example
```http
POST https://YOUR-REWARDS-DOMAIN/api/purchases/webhook
x-integration-key: YOUR_PURCHASE_WEBHOOK_KEY
Content-Type: application/json
```
```json
{
  "memberId": "FZR-10001",
  "amount": 180,
  "source": "online",
  "externalOrderId": "ORDER-1042",
  "status": "completed"
}
```

## How customers are matched
Preferred: member ID. This is safest because it directly links the purchase to the Rewards account.

Alternative: email address. The ordering/POS system can send the customer's rewards email if it is available.

## How store purchases work
If the POS can call webhooks, use the same endpoint with `source: store`.

If it cannot, staff can open **Admin → Purchases**, enter the customer's member ID and purchase amount, and record the purchase. The app will add points and keep the transaction in the ledger.

## Preventing duplicates
Every automatic transaction should have a unique `externalOrderId`. The database prevents the same source/order ID from being imported twice.

## Points
Current rule: 25% of the purchase amount, rounded down to whole points (R100 = 25 points). This is intentionally centralized in the purchase endpoint so the business rule can be changed later.

## Security
- Keep `PURCHASE_WEBHOOK_KEY` private.
- Do not expose it in browser JavaScript.
- Use HTTPS in production.
- Only send completed/paid orders if the business wants points for completed purchases.
- If an order is refunded or cancelled, a reverse-transaction policy should be added before enabling refunds in production.

## What we need before the automatic connection
Identify the current online ordering provider and physical POS provider. We then check whether each offers a webhook/API/export/integration. If one does not, keep the manual Admin → Purchases workflow for that channel.
