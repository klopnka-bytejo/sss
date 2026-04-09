# Elevate Gaming Workflow Audit & Implementation Plan

## Critical Workflows to Implement

### 1. PRO Application → Approval → Role Change Workflow
**Current State:** PRO application form exists at `/become-pro`, but workflow incomplete
**Required Flow:**
1. Client submits application via `/become-pro` form
2. Application stored in `pro_profiles` table with `status='pending'`
3. Admin reviews application at `/admin/applications`
4. Admin approves/rejects
5. On approval: User role changes from 'client' to 'pro' in profiles table
6. PRO profile created/activated
7. User redirected to PRO dashboard

**Files Needing Fixes:**
- `app/become-pro/page.tsx` - Ensure submission works correctly
- `app/api/pro-applications/route.ts` - Ensure creates pro_profiles record
- `app/admin/applications/page.tsx` - Implement approval logic
- `app/api/admin/applications/route.ts` - PATCH endpoint for approvals
- Missing: Notifications/emails on approval

### 2. Order Creation Workflow
**Current State:** Checkout exists but may not be fully connected
**Required Flow:**
1. Client browses services at `/services`
2. Client clicks service → `/checkout/[serviceId]`
3. Client completes checkout → Stripe payment
4. Stripe webhook confirms payment
5. Order created with `status='paid'`
6. PRO notified of new order
7. PRO accepts order at `/dashboard/pro/orders`
8. Order status changes to `in_progress`

**Files Needing Fixes:**
- `app/checkout/[serviceId]/page.tsx` - Ensure Stripe session creation
- `app/api/checkout/route.ts` - Verify order creation logic
- `app/api/webhooks/stripe/route.ts` - Implement payment confirmation
- Missing: PRO notifications on new order
- Missing: Order acceptance logic

### 3. Order Tracking & Chat Workflow
**Current State:** Order chat exists with polling
**Required Flow:**
1. Client places order, sees order details at `/orders/[id]`
2. Real-time messaging with PRO via order chat
3. System messages for status changes
4. Order progress tracking
5. PRO marks order complete
6. Client receives completion notification

**Files Needing Fixes:**
- `components/order-chat.tsx` - Polling implementation (3s)
- `app/api/orders/[id]/messages/route.ts` - Verify message creation
- Missing: Proper system message generation

### 4. Dispute Resolution Workflow
**Current State:** Dispute API exists
**Required Flow:**
1. Client opens dispute at `/orders/[id]`
2. Dispute stored with `status='open'`
3. Admin notified of new dispute
4. Admin reviews at `/admin/disputes`
5. Admin resolves: 'favor_client' (refund), 'favor_pro' (no refund), or 'partial_refund'
6. Transaction recorded
7. Client/PRO notified of resolution

**Files Needing Fixes:**
- Missing: Client dispute form
- `app/api/admin/disputes/resolve/route.ts` - Implement resolution logic
- Missing: Notification system

### 5. PRO Earnings & Payout Workflow
**Current State:** Earnings page exists
**Required Flow:**
1. PRO completes order
2. Earnings calculated (total - platform fee)
3. Earnings appear in `/dashboard/pro/earnings`
4. PRO requests payout
5. Payout appears in `/admin/withdrawals`
6. Admin approves payout
7. Funds transferred to PRO bank account

**Files Needing Fixes:**
- Missing: Payout request form
- Missing: Payout API endpoints
- Missing: Admin payout approval logic

## UX Features to Implement

### Loading States
- [ ] Add Skeletons to all data-fetching pages
- [ ] Show "Loading..." during form submission
- [ ] Disable buttons during submission

### Empty States
- [ ] No orders → "No orders yet. Browse services."
- [ ] No applications → "No pending applications."
- [ ] No earnings → "No earnings yet. Accept your first order!"

### Success/Error Notifications
- [ ] Toast notifications for all form submissions
- [ ] Success message on application submission
- [ ] Error handling with user-friendly messages
- [ ] Redirect on successful actions

### Confirmation Dialogs
- [ ] Approve/Reject application
- [ ] Mark order complete
- [ ] Request payout
- [ ] Open dispute

### Form Validation
- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Display validation errors inline

### Proper Redirects
- [ ] After login → appropriate dashboard
- [ ] After application submission → confirmation page
- [ ] After order completion → dashboard

## Critical Implementation Order

1. **Priority 1: Admin Application Approval**
   - Fix admin approvals to update user role
   - Ensure pro_profiles creation on approval
   - Test end-to-end workflow

2. **Priority 2: Order Workflow**
   - Fix checkout to create orders
   - Verify Stripe webhook updates orders
   - Add PRO order notification

3. **Priority 3: UX Polish**
   - Add loading states
   - Add empty states
   - Add success notifications
   - Add error handling

4. **Priority 4: Dispute & Payout Systems**
   - Implement dispute opening
   - Implement dispute resolution
   - Implement payout requests
   - Implement payout approval

5. **Priority 5: Notifications**
   - Email notifications
   - In-app notifications
   - Real-time updates
