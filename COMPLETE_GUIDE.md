# 🎂 PurblePalace Platform - Admin & Vendor Dashboard Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Authentication](#authentication)
5. [Admin Dashboard](#admin-dashboard)
6. [Vendor Dashboard](#vendor-dashboard)
7. [API Endpoints](#api-endpoints)
8. [Deployment Guide](#deployment-guide)

---

## 🎯 Overview

A complete role-based admin and vendor management system for PurblePalace built with Next.js, featuring:

- **Three-tier authentication**: Customer, Vendor, Admin
- **Complete vendor onboarding workflow**
- **Real-time analytics with charts**
- **Multi-location support for vendors**
- **Service area management**
- **Order and dispute management**
- **Performance tracking and metrics**

---

## 🏗️ Architecture

### Directory Structure

```
cake-shop/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── vendors/
│   │   │   ├── analytics/
│   │   │   ├── orders/
│   │   │   ├── disputes/
│   │   │   ├── promotions/
│   │   │   └── settings/
│   │   ├── vendor/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── analytics/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   └── api/
│   │       ├── admin/...
│   │       └── vendor/...
│   ├── components/
│   │   ├── admin/
│   │   └── vendor/
│   └── lib/
│       ├── auth.ts
│       ├── db/
│       ├── hooks/
│       └── services/
├── prisma/
│   └── schema.prisma
└── middleware.ts
```

### Data Flow

```
User Login
    ↓
Auth Handler (/src/lib/auth.ts)
    ↓
Role-based Routing
    ├→ Customer → / (home)
    ├→ Vendor → /vendor (dashboard)
    └→ Admin → /admin (dashboard)
    ↓
Middleware Protection (/middleware.ts)
    ↓
Dashboard Pages with Real Data
```

---

## 💾 Database Schema

### Key Models

#### 1. Account (Authentication)
```prisma
model Account {
  id              String        @id @default(cuid())
  email           String        @unique
  password        String?       // bcrypt hashed
  phone           String?
  name            String
  role            String        // "vendor" | "admin"
  vendorId        String?       @unique  // if role = vendor
  adminRole       String?       // "super_admin" | "admin" | "moderator"
  adminPermissions String[]     // granular permissions
  isActive        Boolean       @default(true)
  lastLogin       DateTime?
  createdAt       DateTime      @default(now())
}
```

#### 2. Vendor (Business Profile)
```prisma
model Vendor {
  id                String              @id @default(cuid())
  name              String
  slug              String              @unique
  description       String?
  verificationStatus String             @default("pending")  // pending | verified | rejected
  approvalStatus    String             @default("pending")  // pending | approved | rejected
  
  // Relations
  account           Account?            // 1-1 with Account
  profile           VendorProfile?      // Business details
  locations         VendorLocation[]    // Multiple locations
  serviceAreas      VendorServiceArea[] // Service coverage
  analytics         VendorAnalytics?    // Performance metrics
  cakes             Cake[]              // Products
  orders            Order[]             // Orders
}
```

#### 3. VendorProfile (Business Information)
```prisma
model VendorProfile {
  id                  String        @id @default(cuid())
  vendorId            String        @unique
  
  businessName        String
  businessType        String        // "Sole Proprietor" | "Partnership" | "Company"
  gstNumber           String?       @unique
  panNumber           String?       @unique
  
  // Owner Information
  ownerName           String
  ownerPhone          String
  ownerEmail          String
  
  // Bank Details
  bankAccountNumber   String
  bankIfscCode        String
  bankAccountHolderName String
  
  // Documents (S3/R2 URLs)
  businessProof       String?
  idProof             String?
  addressProof        String?
  
  // Verification
  verificationStatus  String        @default("pending")
  isApproved          Boolean       @default(false)
  approvedAt          DateTime?
}
```

#### 4. VendorLocation (Multiple Locations)
```prisma
model VendorLocation {
  id              String        @id @default(cuid())
  vendorId        String
  
  type            String        // "primary" | "warehouse" | "outlet"
  locationName    String        // "Main Store", "Downtown Branch"
  
  // Address
  street          String
  city            String
  state           String
  postalCode      String
  country         String
  
  // Geolocation
  latitude        Float
  longitude       Float
  placeId         String?       // Google Maps Place ID
  
  // Operational
  operatingHours  Json          // {mon: {open: "09:00", close: "22:00"}}
  preparationTime Int?          // minutes
  maxOrders       Int?          // daily limit
  
  @@unique([vendorId, postalCode, type])
}
```

#### 5. VendorServiceArea (Service Coverage)
```prisma
model VendorServiceArea {
  id              String        @id @default(cuid())
  vendorId        String
  
  // Coverage Area
  areaName        String        // "Delhi Central"
  pincode         String        // "110001"
  city            String
  state           String
  
  // Geolocation
  centerLatitude  Float
  centerLongitude Float
  deliveryRadius  Float         // in km
  
  // Delivery Settings
  deliveryFee     Float
  minDeliveryTime Int           // minutes
  maxDeliveryTime Int           // minutes
  freeDeliveryAbove Float?      // above this amount
  
  isAvailable     Boolean       @default(true)
  
  @@unique([vendorId, pincode])
}
```

#### 6. VendorAnalytics (Performance Metrics)
```prisma
model VendorAnalytics {
  id                  String        @id @default(cuid())
  vendorId            String        @unique
  date                DateTime
  
  // Metrics
  totalOrders         Int           @default(0)
  completedOrders     Int           @default(0)
  cancelledOrders     Int           @default(0)
  totalRevenue        Float         @default(0)
  averageOrderValue   Float         @default(0)
  
  // Performance
  orderAcceptanceRate Float         @default(100)  // %
  orderCompletionRate Float         @default(100)  // %
  averageDeliveryTime Int           @default(0)    // minutes
  
  // Customer Satisfaction
  averageRating       Float         @default(0)
  totalReviews        Int           @default(0)
  customerSatisfaction Float        @default(0)    // %
  
  @@unique([vendorId, date])
}
```

#### 7. VendorRequest (Change Management)
```prisma
model VendorRequest {
  id              String        @id @default(cuid())
  vendorId        String
  
  requestType     String        // "onboarding" | "profile_update" | "service_area_change"
  status          String        @default("pending")  // pending | approved | rejected
  
  details         Json          // Request data
  submittedBy     String        // Vendor email
  reviewedBy      String?       // Admin email
  rejectionReason String?
  
  submittedAt     DateTime      @default(now())
  reviewedAt      DateTime?
}
```

---

## 🔐 Authentication

### Sign Up Flow

**1. Customer Sign Up**
```
Form Input: Email, Name, Phone, Password
    ↓
Validation
    ↓
Create User record
    ↓
Hash password with bcryptjs
    ↓
Redirect to home page
```

**2. Vendor Sign Up**
```
Form Input: Email, Name, Phone, Password
    ↓
Validation
    ↓
Create Vendor record (auto-slug)
    ↓
Create Account record with role="vendor"
    ↓
Initialize VendorAnalytics
    ↓
Redirect to /vendor/onboarding
```

**3. Admin Sign Up** (usually done by existing admin)
```
Form Input: Email, Name, Phone, Password
    ↓
Admin permission check
    ↓
Create Account record with role="admin"
    ↓
Set admin permissions
    ↓
Initialize audit logging
    ↓
Redirect to /admin
```

### Login Flow

```
User Input: Email, Password, Role
    ↓
Fetch Account by email
    ↓
Verify password with bcrypt
    ↓
Check account is active
    ↓
Update lastLogin timestamp
    ↓
Generate JWT with: {id, email, name, role, vendorId}
    ↓
Create session
    ↓
Role-based redirect
```

### Middleware Protection

```typescript
// Protected routes
/admin/*     → Only role="admin"
/vendor/*    → Only role="vendor"

// Unprotected routes
/             → All users
/auth/login  → Unauthenticated users
```

---

## 👨‍💼 Admin Dashboard

### Overview (`/admin`)

**KPI Cards:**
- Total Revenue (₹)
- Total Orders (#)
- Active Vendors (# / Total)
- Disputes Pending (#)

**Charts:**
- Revenue Trend (Line Chart)
- Order Status (Pie Chart)
- Top Vendors (Table)

### Vendor Management (`/admin/vendors`)

**Functionality:**
- View all vendors with pagination
- Filter by: Status (Approved/Pending/Rejected), Verification (Verified/Pending/Rejected)
- Search by vendor name or email
- View vendor details
- Approve/Reject onboarding requests
- Verify vendor documents
- View vendor performance metrics

**Table Columns:**
| Vendor | Owner | Orders | Revenue | Rating | Status | Verification | Actions |
|--------|-------|--------|---------|--------|--------|--------------|---------|
| Name & Email | Name & Phone | # | ₹ | ⭐ | Badge | Badge | View, Approve/Reject, Verify |

### Orders Management (`/admin/orders`)

**Functionality:**
- View all platform orders
- Filter by status (Delivered/Delivering/Preparing/Pending/Cancelled)
- Search by order ID or customer name
- View detailed order information
- Process refunds for cancelled orders
- Handle order disputes

**Table Columns:**
| Order ID | Customer | Vendor | Amount | Date | Status | Actions |
|----------|----------|--------|--------|------|--------|---------|
| ORD-001 | Name | Vendor Name | ₹ | Date | Badge | View, Refund, Dispute |

### Analytics (`/admin/analytics`)

**Charts:**
- Revenue Trend (Line Chart - Last 30 days)
- Order Growth (Bar Chart - Orders & Vendors)
- Order Categories (Pie Chart - Birthday, Wedding, Custom, Other)
- Top Vendors Performance (Table)

**Metrics Displayed:**
- Total Revenue
- Total Orders
- Growth Rate (%)
- Top Products
- Revenue by Category

### Disputes (`/admin/disputes`)

**Features:**
- List all complaints and disputes
- Filter by status (Open/Investigating/Resolved/Closed)
- Assign to admin
- Set priority level
- Add resolution notes
- Track resolution timeline

### Promotions (`/admin/promotions`)

**Features:**
- Create and manage coupon codes
- Set discount type (Fixed Amount / Percentage)
- Configure usage limits
- Define applicability (All Vendors / Specific Vendors / Specific Products)
- Monitor coupon usage
- Deactivate expired coupons

### Settings (`/admin/settings`)

**Features:**
- Manage admin users
- Assign roles and permissions
- Configure payment gateway
- Set platform rules and policies
- View audit logs

---

## 🏪 Vendor Dashboard

### Overview (`/vendor`)

**Quick Stats Cards:**
- Today's Orders (#)
- Total Revenue (₹)
- Average Rating (⭐)
- Completion Rate (%)
- Pending Orders (#)

**Charts:**
- Weekly Revenue & Orders (Area Chart)
- Order Status Distribution (Pie Chart)
- Top Selling Products (Table)

### Products Management (`/vendor/products`)

**CRUD Operations:**
- Create new product with:
  - Name, Description
  - Category (Birthday, Wedding, Custom)
  - Base Price
  - Flavors, Sizes, Toppings
  - Images (multi-upload)
  - Customization options
  - Tags & Ratings

- Edit existing products
- Delete products
- Bulk upload (CSV)
- View product analytics (orders, revenue, ratings)

**Filters:**
- Search by name
- Filter by category
- Filter by status (Active/Inactive)

### Orders Management (`/vendor/orders`)

**Features:**
- View all vendor orders
- Real-time order notifications
- Order status tracking:
  - Pending → Confirmed → Preparing → Ready → Picked Up → Out for Delivery → Delivered
  
- Actions:
  - Confirm/Accept order
  - Mark as preparing
  - Update preparation progress
  - Mark ready for pickup
  - Add delivery notes
  - Cancel order (with reason)
  - View customer feedback

**Table Columns:**
| Order ID | Customer | Product | Amount | Date | Time | Status | Actions |
|----------|----------|---------|--------|------|------|--------|---------|

### Analytics (`/vendor/analytics`)

**Time Periods:**
- Today
- Last 7 Days
- Last 30 Days
- Last Quarter
- Year to Date

**Charts:**
- Revenue Trend (Line Chart)
- Orders Trend (Bar Chart)
- Customer Rating Trend (Line Chart)
- Category Performance (Bar Chart)
- Customer Demographics (Pie Chart)

**Metrics:**
- Avg Daily Revenue
- Avg Daily Orders
- Avg Customer Rating
- Completion Rate
- Top Products
- Low Performing Products
- Customer Satisfaction Score

### Profile (`/vendor/profile`)

**Sections:**
1. **Business Information**
   - Shop name
   - Description
   - Category/Cuisine types
   - Contact information

2. **Locations**
   - Add/Edit/Delete multiple locations
   - Set primary location
   - Operating hours per location
   - Preparation time per location

3. **Service Areas**
   - Add service areas by pincode
   - Set delivery fees
   - Delivery time estimates
   - Radius coverage
   - Free delivery threshold

4. **Banking Details**
   - Account holder name
   - Account number
   - IFSC code
   - Bank name

5. **Documents**
   - Upload GST certificate
   - Upload PAN card
   - Upload ID proof
   - Upload address proof

6. **Verification Status**
   - View current status
   - Submit verification request
   - View feedback from admin

---

## 🔌 API Endpoints

### Admin API Routes

```
GET    /api/admin/vendors                    - List vendors
GET    /api/admin/vendors/:id                - Vendor details
POST   /api/admin/vendors/:id/approve        - Approve onboarding
POST   /api/admin/vendors/:id/reject         - Reject onboarding
POST   /api/admin/vendors/:id/verify         - Verify documents
GET    /api/admin/analytics/dashboard        - Dashboard metrics
GET    /api/admin/analytics/orders           - Orders analytics
GET    /api/admin/analytics/revenue          - Revenue analytics
GET    /api/admin/analytics/vendors-perf     - Vendor performance
GET    /api/admin/orders                     - List all orders
GET    /api/admin/orders/:id                 - Order details
POST   /api/admin/orders/:id/refund          - Refund order
GET    /api/admin/disputes                   - List disputes
POST   /api/admin/disputes/:id/resolve       - Resolve dispute
GET    /api/admin/coupons                    - List coupons
POST   /api/admin/coupons                    - Create coupon
PUT    /api/admin/coupons/:id                - Update coupon
```

### Vendor API Routes

```
GET    /api/vendor/profile                   - Get vendor profile
PUT    /api/vendor/profile                   - Update profile
GET    /api/vendor/locations                 - Get all locations
POST   /api/vendor/locations                 - Add location
PUT    /api/vendor/locations/:id             - Update location
DELETE /api/vendor/locations/:id             - Delete location
GET    /api/vendor/service-areas             - Get service areas
POST   /api/vendor/service-areas             - Add service area
PUT    /api/vendor/service-areas/:id         - Update service area
GET    /api/vendor/products                  - List products
POST   /api/vendor/products                  - Create product
GET    /api/vendor/products/:id              - Product details
PUT    /api/vendor/products/:id              - Update product
DELETE /api/vendor/products/:id              - Delete product
POST   /api/vendor/products/bulk             - Bulk upload
GET    /api/vendor/orders                    - List orders
GET    /api/vendor/orders/:id                - Order details
PATCH  /api/vendor/orders/:id/status         - Update status
POST   /api/vendor/orders/:id/notes          - Add notes
GET    /api/vendor/analytics/dashboard       - Dashboard metrics
GET    /api/vendor/analytics/products        - Product performance
GET    /api/vendor/analytics/revenue         - Revenue metrics
GET    /api/vendor/analytics/customers       - Customer insights
```

---

## 🚀 Deployment Guide

### Step 1: Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# (Optional) Seed demo data
npx prisma db seed
```

### Step 2: Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/cake_shop"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://yourdomain.com"

# AWS S3 / Cloudflare R2
NEXT_PUBLIC_S3_BUCKET="your-bucket"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"

# Email Service
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASS="your-password"

# Razorpay (for payments)
NEXT_PUBLIC_RAZORPAY_KEY="your-public-key"
RAZORPAY_SECRET="your-secret-key"
```

### Step 3: Build & Deploy

```bash
# Build
npm run build

# Start production server
npm run start

# Or deploy to Vercel
vercel deploy --prod
```

### Step 4: Post-Deployment

1. Create first admin account manually
2. Verify email configuration
3. Test payment gateway
4. Set up monitoring/alerts
5. Configure backups
6. Set up CDN for static files

---

## 📈 Key Metrics to Track

### Admin Dashboard Metrics
- Total Revenue (Daily, Weekly, Monthly)
- Total Orders (Completed, Cancelled, Pending)
- Vendor Count (Active, Pending Approval)
- Customer Growth Rate
- Order Fulfillment Rate
- Average Delivery Time
- Payment Success Rate
- Customer Satisfaction Score

### Vendor Metrics
- Daily/Monthly Revenue
- Orders per Day
- Completion Rate (%)
- Average Preparation Time
- Customer Rating & Reviews
- Product Performance
- Service Area Coverage
- Repeat Customer Rate

---

## 🔒 Security Features

1. **Password Security**
   - bcryptjs hashing (salt rounds: 10)
   - No plain-text storage

2. **Session Security**
   - JWT tokens with expiry
   - Secure HTTP-only cookies
   - CSRF protection

3. **Database Security**
   - Parameterized queries via Prisma
   - Role-based access control
   - Audit logging

4. **API Security**
   - Rate limiting (coming soon)
   - Input validation
   - HTTPS enforced
   - CORS configuration

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Error**
- Check DATABASE_URL is correct
- Verify database is running
- Check network connectivity

**Auth Token Expired**
- User needs to login again
- Token refresh logic in callbacks

**File Upload Failed**
- Check S3/R2 credentials
- Verify bucket permissions
- Check file size limits

---

## 🎓 Next Steps

1. ✅ **Immediate**: Run database migration
2. 🔄 **Week 1**: Create API routes and connect to database
3. 🔄 **Week 2**: Implement file uploads and email notifications
4. 🔄 **Week 3**: Add real-time features (WebSockets)
5. 🔄 **Week 4**: Performance optimization and testing

---

**Last Updated**: January 6, 2026  
**Version**: 1.0.0-beta  
**Status**: Ready for Database Migration & API Development
