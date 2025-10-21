# Manual Payment Setup Guide

Your Artisan Lux store uses a **manual payment system** where customers place orders and send payment via bank transfer, EcoCash, or other methods. You then verify payments and confirm orders in the admin panel.

## Setting Up Payment Details

### 1. Update Your .env File

Add your real payment details in the `.env` file:

```bash
# Bank Account
BANK_NAME=Your Bank Name (e.g., CBZ Bank, Stanbic)
BANK_ACCOUNT_NAME=Your Full Name or Business Name
BANK_ACCOUNT_NUMBER=1234567890
BANK_BRANCH=Branch Name (e.g., Harare Main Branch)

# Mobile Money
ECOCASH_NUMBER=+263771234567
ECOCASH_NAME=Your Registered Name

# Alternative Payment Methods (optional)
ONEMONEY_NUMBER=+263771234567
INNBUCKS_NUMBER=+263771234567
```

### 2. Run Database Migration

Add the payment proof fields to your database:

```bash
npm run db:generate
npm run db:push
```

## How It Works

### Customer Flow:
1. Customer browses products
2. Clicks **"Buy Now"** or **"Add to Cart"**
3. Proceeds to checkout
4. Gets redirected to **Payment Instructions** page showing:
   - Your bank details
   - Your EcoCash number
   - Order reference number
   - Total amount to pay
5. Customer makes payment via their preferred method
6. Customer uploads **proof of payment** (screenshot/photo)
7. Customer waits for confirmation

### Your Flow (Admin):
1. Get **real-time notification** when order is placed
2. Get **alert** when payment proof is uploaded
3. Open admin dashboard at `/admin`
4. Review order details and payment proof
5. Verify payment received in your bank/EcoCash
6. Click **"Confirm Payment"** button
7. Order status changes to "Paid"
8. Customer can see confirmation

## Admin Dashboard

Access your admin panel at: `http://localhost:3000/admin`

Features:
- ✅ Real-time order notifications
- ✅ View all orders with status
- ✅ See payment proofs submitted by customers
- ✅ Confirm or reject payments
- ✅ View order history

## Payment Proof Storage

Uploaded payment proofs are stored in:
```
public/uploads/payment-proofs/
```

**Important:** Add this to your `.gitignore`:
```
public/uploads/
```

## Supported Payment Methods

### 1. **Bank Transfer** (Recommended)
- Most secure
- Traceable
- Works for large amounts
- Takes 1-24 hours to reflect

**Customer Instructions:**
- Transfer exact amount
- Use Order Reference: ORD-{order_id}
- Screenshot confirmation
- Upload proof

### 2. **EcoCash** (Popular)
- Instant
- Convenient for Zimbabweans
- Lower transaction limits
- Easy to verify

**Customer Instructions:**
- Send Money to your number
- Use exact amount
- Screenshot confirmation SMS
- Upload proof

### 3. **OneMoney / InnBucks** (Optional)
- Alternative mobile money
- Similar to EcoCash
- Configure in `.env` if you accept these

## Testing the System

### Test Locally:
1. Add your test payment details in `.env`
2. Start dev server: `npm run dev`
3. Place a test order
4. Check payment instructions page
5. Upload a test image as proof
6. Verify notification appears in admin panel

### Test Production:
1. Deploy to Vercel/Netlify
2. Update `.env` on hosting platform
3. Place real order with small amount
4. Verify full flow works
5. Confirm payment manually

## Security Best Practices

⚠️ **Never commit `.env` files**
⚠️ **Use HTTPS in production**
⚠️ **Verify every payment proof manually**
⚠️ **Keep payment details up to date**
⚠️ **Backup uploaded proofs regularly**

## Common Issues

### Payment proof not uploading
- Check file size (max 5MB)
- Ensure image format (JPG, PNG)
- Check folder permissions: `public/uploads`

### Orders not appearing
- Verify database is connected
- Check `/admin` dashboard
- Look for JavaScript errors in console

### Notifications not working
- Ensure `/api/socket` endpoint is accessible
- Check browser console for SSE errors
- Refresh admin dashboard

## Customer Support

When customers contact you about payments:

1. **Ask for Order ID** (ORD-XXX)
2. **Check admin dashboard** for their order
3. **Verify proof was uploaded**
4. **Check your bank/EcoCash** for payment
5. **Confirm or reject** via admin panel
6. **Communicate status** to customer

## Going Live Checklist

- [ ] Add real bank details in `.env`
- [ ] Add real EcoCash number in `.env`
- [ ] Test full order flow end-to-end
- [ ] Verify payment proofs save correctly
- [ ] Test admin confirmation workflow
- [ ] Add backup contact info on site
- [ ] Document your process for staff
- [ ] Set up backup of payment proofs

## Need Help?

- Check uploaded proofs in: `public/uploads/payment-proofs/`
- Review orders in admin dashboard: `/admin`
- Check real-time notifications are working
- Verify database migration ran successfully

---

**This system is perfect for Zimbabwe and other markets where traditional payment gateways aren't available!**
