# Complete Testing Checklist - Gaming Marketplace

## 🚀 Quick Start Testing

### 1. LANDING PAGE TESTS
- [ ] Home page loads without errors
- [ ] Featured games display correctly
- [ ] Featured services display correctly
- [ ] "Explore Services" button redirects to /explore
- [ ] "How It Works" button links to /how-it-works
- [ ] "Get Started" button redirects to /auth/register
- [ ] "Learn More" button on each service card works
- [ ] Navigation links work: Games, Services, About, FAQ
- [ ] Become PRO button redirects to /become-pro
- [ ] Login/Sign Up buttons work

### 2. GAMES PAGE TESTS
- [ ] All games display with images and service counts
- [ ] Click game → opens /games/[slug] page
- [ ] Services for selected game display correctly
- [ ] View Service button on each service works
- [ ] Filter/search functionality works (if implemented)

### 3. SERVICES PAGE TESTS
- [ ] All services display with pricing and image
- [ ] View details button → /services/[id]
- [ ] Service detail page loads
- [ ] Dynamic pricing calculator works
- [ ] Add to cart button works (redirects to login if not authenticated)
- [ ] Buy Now button works (creates checkout)

### 4. AUTHENTICATION TESTS
- [ ] Register page loads
- [ ] Email/password registration works
- [ ] Verify email link works (if required)
- [ ] Login page loads
- [ ] Email/password login works
- [ ] Logout works
- [ ] Role selector (Client/PRO) on register works
- [ ] Redirect after login works

### 5. SHOPPING & CHECKOUT TESTS
- [ ] Add service to cart
- [ ] Cart page loads
- [ ] View cart items
- [ ] Remove item from cart works
- [ ] Update quantity works
- [ ] Checkout button → Stripe checkout page
- [ ] Stripe payment processes successfully
- [ ] Order created after successful payment
- [ ] Redirect to order confirmation works

### 6. CLIENT DASHBOARD TESTS
- [ ] Dashboard loads with correct stats
- [ ] Orders page displays user's orders
- [ ] Order detail page shows all information
- [ ] Chat with PRO loads messages
- [ ] Send message works and appears instantly
- [ ] Review button appears for completed orders
- [ ] Leave review dialog works
- [ ] Star rating selection works
- [ ] Submit review successfully updates order
- [ ] Dispute button appears for pending orders
- [ ] Open dispute dialog works
- [ ] Submit dispute successfully creates dispute
- [ ] Wallet page shows balance
- [ ] Deposit button works (Stripe checkout)
- [ ] Profile page shows user info
- [ ] Edit profile button works
- [ ] Settings page has all tabs (Profile, Security, Notifications, Privacy)
- [ ] Save settings works

### 7. PRO APPLICATION TESTS
- [ ] Become PRO page loads
- [ ] Select games works (multi-select)
- [ ] Enter experience hours
- [ ] Enter gaming profile/links
- [ ] Agree to terms checkbox works
- [ ] Submit application button works
- [ ] Confirmation message displays
- [ ] Application appears in admin panel

### 8. PRO DASHBOARD TESTS
- [ ] Dashboard loads with PRO stats
- [ ] Available Orders page displays FCFS orders
- [ ] Order refreshes every 30 seconds
- [ ] Claim order button works (marks as accepted)
- [ ] My Orders page shows claimed orders
- [ ] Order detail page displays with chat
- [ ] Submit proof button works (requires link + summary)
- [ ] Completion triggers 24-hour hold
- [ ] Availability settings page loads
- [ ] Toggle accepting orders works
- [ ] Set weekly schedule works (time slots)
- [ ] Select delivery methods works
- [ ] Select games works
- [ ] Select platforms works
- [ ] Save settings works
- [ ] Earnings page displays balance and transaction history
- [ ] Deposit funds button works (Stripe)
- [ ] Withdraw button works (PayPal/Crypto/Bank)
- [ ] Minimum withdrawal amounts enforced

### 9. ADMIN DASHBOARD TESTS
- [ ] Admin dashboard loads
- [ ] Stats cards display (Users, Orders, PROs, Disputes)
- [ ] Recent activity feeds show
- [ ] All sidebar links work

### 10. ADMIN GAMES MANAGEMENT TESTS
- [ ] Games list displays all games
- [ ] Add new game button works
- [ ] Game form validates required fields
- [ ] Submit new game creates game
- [ ] Edit game button works
- [ ] Delete game button works (if no services)
- [ ] Toggle active status works
- [ ] Drag to reorder works (sort_order)

### 11. ADMIN SERVICES MANAGEMENT TESTS
- [ ] Services list displays
- [ ] Filter by game works
- [ ] Add service button works
- [ ] Service form has game dropdown
- [ ] Pricing type selector works (fixed/dynamic)
- [ ] Delivery type selector works
- [ ] Submit creates service
- [ ] Edit service works
- [ ] Delete service works (if no active orders)
- [ ] Toggle active works

### 12. ADMIN ORDERS MANAGEMENT TESTS
- [ ] Orders list displays all orders
- [ ] Status filter works (pending/in_progress/under_review/completed)
- [ ] Assign PRO dropdown works
- [ ] Update order status works
- [ ] Release payout button works (if in hold)
- [ ] View order detail works

### 13. ADMIN APPLICATIONS TESTS
- [ ] Applications list displays
- [ ] Status filter works (pending/under_review/approved)
- [ ] View application detail button works
- [ ] Approve button converts user to PRO
- [ ] Reject button removes application
- [ ] Request more info button works
- [ ] Add notes field works

### 14. ADMIN DISPUTES TESTS
- [ ] Disputes list displays
- [ ] Status filter works
- [ ] View dispute detail shows all evidence
- [ ] Favor client button issues refund
- [ ] Favor PRO button processes payout
- [ ] Partial refund slider works
- [ ] Submit resolution updates dispute

### 15. ADMIN WITHDRAWALS TESTS
- [ ] Withdrawals list shows pending requests
- [ ] Withdrawal detail shows user and amount
- [ ] Approve button processes withdrawal
- [ ] Reject button returns funds to balance
- [ ] Add notes field works

### 16. ADMIN CHAT MONITORING TESTS
- [ ] Chat monitoring dashboard loads
- [ ] Shows blocked message stats
- [ ] Search moderation logs works
- [ ] Flagged chats tab shows orders with violations
- [ ] Click to view order works

### 17. ADMIN AUDIT LOGS TESTS
- [ ] Audit log list displays
- [ ] Search by action/entity works
- [ ] Date filter works
- [ ] View all admin actions logged
- [ ] Timestamp and user info display correctly

### 18. SUPPORT FEATURES TESTS
- [ ] Support page loads
- [ ] Category dropdown works
- [ ] Subject/message fields work
- [ ] Order ID lookup works
- [ ] Submit ticket works
- [ ] Confirmation message displays

### 19. API TESTS (using curl or Postman)
- [ ] POST /api/cart - Add item succeeds
- [ ] DELETE /api/cart - Remove item succeeds
- [ ] POST /api/checkout/process - Creates Stripe session
- [ ] POST /api/orders/accept - Assigns PRO to order
- [ ] POST /api/orders/complete - Submits proof
- [ ] POST /api/orders/review - Creates review
- [ ] POST /api/orders/dispute - Creates dispute
- [ ] POST /api/wallet/deposit - Creates deposit session
- [ ] POST /api/pro/apply - Submits application
- [ ] POST /api/pro/availability - Updates availability
- [ ] All admin endpoints return proper auth checks

### 20. DATABASE VERIFICATION TESTS
- [ ] Users can create accounts (profiles table)
- [ ] Orders persist after creation
- [ ] Chat messages save and display
- [ ] Reviews save correctly
- [ ] Disputes save with evidence
- [ ] Fines deduct from PRO earnings
- [ ] Withdrawals calculate correctly

## 🔍 Error Cases to Test

- [ ] Try to add to cart without login → redirects to login
- [ ] Try invalid email on register → shows error
- [ ] Try duplicate email on register → shows error
- [ ] Try weak password → shows error
- [ ] Try to checkout with empty cart → shows error
- [ ] Try to access /admin without admin role → 403 error
- [ ] Try to claim already claimed order → error
- [ ] Try negative withdrawal amount → error
- [ ] Try to delete game with services → error
- [ ] Try to submit review twice → error
- [ ] External contact in chat (Discord link) → blocked message
- [ ] Missing proof when completing order → validation error

## 📊 Performance Checks

- [ ] Landing page loads in < 2 seconds
- [ ] Game/service pages load in < 2 seconds
- [ ] Admin dashboard loads in < 3 seconds
- [ ] No console errors on any page
- [ ] Images load correctly
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Forms validate quickly
- [ ] Buttons disable during loading

## ✨ Visual Checks

- [ ] Design is consistent across all pages
- [ ] Colors match the color scheme
- [ ] Typography looks professional
- [ ] Spacing and layout are balanced
- [ ] Buttons are clearly clickable
- [ ] Forms are easy to fill
- [ ] Loading states show spinners
- [ ] Success messages display green
- [ ] Error messages display red
- [ ] Hover effects work on interactive elements

---

## 🚨 Critical Paths to Test First

1. **User Registration & Login** - Without this, nothing else works
2. **Shopping (Add to Cart → Checkout → Payment)** - Core revenue flow
3. **PRO Order Management (Available → Claim → Complete)** - Core service delivery
4. **Order Chat & Moderation** - Safety critical
5. **Admin Dispute Resolution** - Trust critical
6. **Withdrawal Processing** - Financial critical

Once these work flawlessly, test secondary features.

## 📝 Notes

- Use test Stripe card: 4242 4242 4242 4242
- Use any future date for expiry (MM/YY)
- Use any 3-digit CVC
- Check browser console for JavaScript errors
- Check Network tab for failed API calls
- Monitor Supabase logs for database errors
