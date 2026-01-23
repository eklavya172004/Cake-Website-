# CakeShop Admin & Vendor Dashboard Setup

## 🎯 Project Overview

This is a comprehensive admin and vendor dashboard system for the CakeShop platform with role-based access control, real-time analytics, and complete vendor management.

## 📁 Project Structure

### Authentication
- `/src/app/auth/login` - Combined login/signup page with role selection
- `/src/middleware.ts` - Role-based route protection

### Admin Dashboard
- `/src/app/admin/` - Main admin dashboard with charts
- `/src/app/admin/vendors/` - Vendor management and verification
- `/src/app/admin/analytics/` - Platform-wide analytics and insights
- `/src/app/admin/orders/` - Order management and refunds
- `/src/app/admin/disputes/` - Dispute and complaint handling
- `/src/app/admin/promotions/` - Coupon and promotion management
- `/src/app/admin/settings/` - Platform settings and admin management

### Vendor Dashboard
- `/src/app/vendor/` - Main vendor dashboard with quick stats
- `/src/app/vendor/products/` - Product management (Create, Edit, Delete)
- `/src/app/vendor/orders/` - Order management and status updates
- `/src/app/vendor/analytics/` - Vendor-specific analytics and insights
- `/src/app/vendor/profile/` - Profile and business information management
- `/src/app/vendor/settings/` - Vendor-specific settings

## 🔐 Database Schema Updates

The following models have been added to `prisma/schema.prisma`:

1. **Account** - Unified authentication for vendors and admins
   - Email, password (hashed), phone, name
   - Role-based access: vendor, admin
   - Admin permissions array
   - Audit logging support

2. **VendorProfile** - Detailed vendor business information
   - Business details, owner info, bank details
   - Document uploads (GST, PAN, ID, Address proof)
   - Verification and approval status tracking

3. **VendorLocation** - Multiple physical locations
   - Full address with geolocation
   - Operating hours per location
   - Preparation time per location

4. **VendorServiceArea** - Service coverage areas
   - Pincode-based service areas
   - Delivery fees and timings
   - Delivery radius and polygon coverage

5. **VendorRequest** - Vendor change requests
   - Onboarding, profile updates, service area changes
   - Request approval workflow

6. **VendorAnalytics** - Daily analytics snapshots
   - Revenue, orders, completion rates
   - Customer satisfaction metrics
   - Product performance tracking

7. **AuditLog** - Activity tracking
   - All admin actions logged
   - Changes tracked with before/after values

8. **SupportTicket** - Customer support system
   - Vendor support tickets
   - Priority-based handling

9. **CouponCode** - Promotion management
   - Discount codes with usage tracking
   - Vendor and product-specific coupons

10. **Dispute** - Complaint resolution
    - Order-related disputes
    - Resolution tracking

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install bcryptjs recharts
```

### 2. Update Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Run Database Migration
```bash
npx prisma migrate dev --name add_admin_vendor_dashboards
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Dashboards
- **Login Page**: http://localhost:3000/auth/login
- **Admin Dashboard**: http://localhost:3000/admin (after admin login)
- **Vendor Dashboard**: http://localhost:3000/vendor (after vendor login)

## 👤 Demo Credentials

### Admin Account
- Email: `admin@example.com`
- Password: `password123`
- Role: `admin`

### Vendor Account
- Email: `vendor@example.com`
- Password: `password123`
- Role: `vendor`

## 🔐 Authentication Flow

### Sign Up Process
1. User selects role (Customer, Vendor, Admin)
2. Fills signup form with email, password, name, phone
3. For vendors: Creates both Account and Vendor records
4. For admins: Creates Account with admin permissions
5. Password is hashed using bcryptjs
6. User redirected to dashboard after signup

### Login Process
1. User enters email and password
2. System checks Account table
3. Validates password with bcrypt
4. Updates last login timestamp
5. JWT token generated with role and vendorId
6. User redirected based on role

## 📊 Features Implemented

### Admin Dashboard
- ✅ Dashboard with KPI cards (Revenue, Orders, Vendors, Disputes)
- ✅ Revenue trend chart
- ✅ Order status distribution pie chart
- ✅ Top performing vendors table
- ✅ Vendor management with approval/rejection workflow
- ✅ Orders management view
- ✅ Platform-wide analytics with multiple chart types

### Vendor Dashboard
- ✅ Quick stats cards (Today's Orders, Revenue, Rating, Completion Rate)
- ✅ Weekly revenue and orders area chart
- ✅ Order status pie chart
- ✅ Top selling products table
- ✅ Products management (CRUD operations)
- ✅ Orders management with status updates
- ✅ Detailed analytics with time period selection
- ✅ Category performance analysis

## 🎨 UI Components

- **Charts**: Line, Bar, Pie, Area charts using Recharts
- **Tables**: Filterable and searchable data tables
- **Cards**: Dashboard metrics and stats cards
- **Forms**: Input fields, dropdowns, date pickers
- **Buttons**: Primary, secondary, danger actions
- **Badges**: Status indicators and tags

## 🔄 API Routes (To Be Created)

### Admin API Routes
```
GET    /api/admin/vendors
GET    /api/admin/vendors/:id
POST   /api/admin/vendors/:id/approve
POST   /api/admin/vendors/:id/reject
GET    /api/admin/analytics/dashboard
GET    /api/admin/orders
POST   /api/admin/orders/:id/refund
```

### Vendor API Routes
```
GET    /api/vendor/profile
PUT    /api/vendor/profile
POST   /api/vendor/products
GET    /api/vendor/products
PUT    /api/vendor/products/:id
DELETE /api/vendor/products/:id
GET    /api/vendor/orders
PATCH  /api/vendor/orders/:id/status
GET    /api/vendor/analytics/dashboard
```

## 🛠 Technology Stack

- **Framework**: Next.js 16
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Forms**: React with client-side validation
- **Icons**: Lucide React

## 📝 Notes

1. Password hashing requires bcryptjs package (already installed)
2. Role-based middleware protects `/admin` and `/vendor` routes
3. SessionToken includes user role for client-side route handling
4. All dashboard pages are client components for interactivity
5. Charts use sample data - will connect to real API later

## 🚧 Next Steps

1. Create API route handlers for all endpoints
2. Implement form submissions and validations
3. Connect charts to real database queries
4. Add real-time notifications
5. Implement file upload for vendor documents
6. Add email notifications
7. Set up webhook handlers
8. Create database seed with demo data

## 📞 Support

For issues or questions, refer to the dashboard pages or API documentation.

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0
