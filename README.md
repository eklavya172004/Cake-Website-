# 🎂 CakeShop - Multi-Vendor Cake Management Platform

A comprehensive, full-featured e-commerce platform for cake shops with role-based access for customers, vendors, and admins. Built with Next.js 16, TypeScript, Prisma ORM, and PostgreSQL.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black.svg)
![React](https://img.shields.io/badge/React-19.2.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Authentication & Roles](#authentication--roles)
- [API Routes](#api-routes)
- [Admin Dashboard](#admin-dashboard)
- [Vendor Dashboard](#vendor-dashboard)
- [Customer Features](#customer-features)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Three roles - Customer, Vendor, Admin
- **Secure Authentication**: JWT-based sessions with bcryptjs password hashing
- **NextAuth Integration**: Session management and route protection
- **Account Verification**: Email verification for new accounts
- **Last Login Tracking**: Audit trail for account activity

### 👨‍💼 Admin Dashboard
A comprehensive platform management interface with 7 pages:

#### Dashboard Home
- **KPI Cards**: Total Revenue, Total Orders, Active Vendors, Disputes Pending
- **Revenue Trend**: Line chart showing revenue over time
- **Order Status Distribution**: Pie chart of order statuses
- **Top Vendors Performance**: Table with vendor metrics
- **Orders & Vendors Growth**: Bar chart analytics

#### Vendor Management (`/admin/vendors`)
- List all vendors with advanced filtering and search
- Filter by: Status (Approved/Pending/Rejected), Verification (Verified/Pending)
- View detailed vendor information and performance metrics
- Approve/Reject vendor onboarding requests
- Verify vendor documents
- Performance tracking (Revenue, Orders, Rating)

#### Order Management (`/admin/orders`)
- View all platform orders with real-time status
- Advanced search and filtering by order ID, customer, vendor
- Order status tracking (Delivered, In Progress, Pending, Cancelled)
- Process refunds for cancelled orders
- Handle order disputes
- Revenue analytics by time period

#### Analytics (`/admin/analytics`)
- **Revenue Trend**: Historical revenue data with line charts
- **Order Categories**: Distribution of orders by category
- **Growth Metrics**: Orders and vendor growth tracking
- **Top Vendors**: Performance leaderboard
- **Time Period Selection**: Daily, Weekly, Monthly analytics
- **Multi-chart Layouts**: Responsive chart displays

#### Disputes & Support (`/admin/disputes`)
- Complaint resolution system
- Dispute tracking and status management
- Communication tools with customers and vendors

#### Promotions (`/admin/promotions`)
- Coupon and discount code management
- Campaign creation and monitoring
- Promotion performance analytics

#### Settings (`/admin/settings`)
- Admin account management
- Payment gateway configuration (Razorpay integration)
- Platform-wide settings and preferences
- Role management and permissions

### 🏪 Vendor Dashboard
A complete vendor management system with 5 pages:

#### Dashboard Home
- **Quick Stats**: Today's Orders, Total Revenue, Rating, Completion Rate, Pending Orders
- **Weekly Analytics**: Revenue and orders trend (Area Chart)
- **Order Status**: Distribution pie chart
- **Top Selling Products**: Performance table
- **Real-time Updates**: Live data display

#### Products Management (`/vendor/products`)
- Add, Edit, Delete cake products
- Product categorization and tagging
- Inventory management
- Search and filter functionality
- Performance analytics by product
- Price management and promotions

#### Orders Management (`/vendor/orders`)
- View all vendor orders with real-time status
- Order confirmation workflow
- Preparation status tracking
- Dynamic action buttons for order management
- Customer communication tools
- Order history and reports

#### Analytics (`/vendor/analytics`)
- **Revenue Trend**: Historical revenue visualization
- **Orders Trend**: Order volume analytics
- **Customer Rating**: Satisfaction tracking
- **Category Performance**: Product category analysis
- **Time Period Selection**: Customizable date ranges
- **Summary Stats**: Average daily revenue, orders, rating

#### Profile Management (`/vendor/profile`)
- Business information and documentation
- Multiple location management
- Service area configuration
- Operating hours management
- Bank details for payouts
- Document uploads (GST, PAN, Business Proof)
- Verification status tracking

### 👥 Vendor Profile & Onboarding
- **Multi-location Support**: Multiple physical locations
- **Service Area Management**: Define delivery coverage areas
- **Operating Hours**: Set business hours per location
- **Bank Integration**: Store bank details for payouts
- **Document Verification**: Upload and verify business documents
- **Onboarding Workflow**: Step-by-step vendor registration
- **Request Management**: Track profile update requests

### 🛒 Customer Features
- Browse available cakes and vendors
- Advanced search and filtering
- Shopping cart functionality
- Order placement and tracking
- Order history
- Saved addresses
- Reviews and ratings
- Notification system (FCM ready)

### 💳 Payment Integration
- **Razorpay Integration**: Secure payment processing
- **Multi-currency Support**: Handle different payment methods
- **Split Payment**: Distribute payments between vendor and platform
- **Payment Webhooks**: Real-time payment status updates
- **Transaction History**: Detailed payment records
- **Refund Processing**: Handle customer refunds

### 📊 Analytics & Reporting
- **Vendor Analytics**: Revenue, orders, completion rates
- **Platform Analytics**: Overall platform metrics
- **Customer Insights**: Rating and satisfaction tracking
- **Order Analytics**: Status distribution and trends
- **Category Performance**: Product category insights
- **Time-based Reports**: Daily, weekly, monthly analytics
- **Charts & Visualizations**: 10+ chart types with Recharts

### 🔄 Order Management System
- **Order Workflow**: Pending → Confirmed → Preparing → Delivered
- **Real-time Status**: Live order status updates
- **Dispute Resolution**: Handle customer complaints
- **Cancellation Process**: Manage order cancellations
- **Refund Handling**: Process refunds automatically
- **Order Notifications**: Customer and vendor alerts

### 🌐 Service Area Management
- Define delivery coverage by pincode/area
- Distance-based delivery fee calculation
- Free delivery thresholds
- Minimum and maximum delivery time estimation
- Area availability status

### 📝 Audit & Compliance
- **Audit Logs**: Track all admin actions
- **Verification Status**: Document verification tracking
- **Approval Workflow**: Multi-step approval process
- **Request Management**: Track and manage vendor requests
- **Activity Logging**: Complete activity trail

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org) - React framework with server-side rendering
- **Language**: [TypeScript 5](https://www.typescriptlang.org) - Type-safe JavaScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com) - Accessible component library
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful icon library
- **Animations**: [Framer Motion 12](https://www.framer.com/motion) & [GSAP 3.14](https://greensock.com/gsap)
- **Data Visualization**: [Recharts 3.6](https://recharts.org) - Composable chart library

### Backend
- **Runtime**: [Node.js](https://nodejs.org)
- **ORM**: [Prisma 6](https://www.prisma.io) - Type-safe database access
- **Database**: [PostgreSQL](https://www.postgresql.org) - Relational database
- **Authentication**: [NextAuth.js 4.24](https://next-auth.js.org) - Authentication for Next.js
- **Password Hashing**: [bcryptjs 3.0](https://github.com/dcodeIO/bcrypt.js) - Secure password hashing
- **Validation**: [Zod 4.2](https://zod.dev) - TypeScript-first schema validation

### Integrations
- **Payment Gateway**: [Razorpay 2.9](https://razorpay.com) - Payment processing
- **Email**: [Nodemailer 7.0](https://nodemailer.com) - Email sending
- **HTTP Client**: [Axios 1.13](https://axios-http.com) - HTTP requests
- **State Management**: [Zustand 5.0](https://zustand-demo.vercel.app) - Simple state management

### Development Tools
- **Linting**: [ESLint 9](https://eslint.org) - Code quality
- **PostCSS**: [PostCSS 4](https://postcss.org) - CSS transformations
- **Package Manager**: [npm](https://www.npmjs.com)

---

## 📁 Project Structure

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
│   │   │   ├── vendors/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── disputes/page.tsx
│   │   │   ├── promotions/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── vendor/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── products/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── cakes/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── profile/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── middleware.ts
│   └── public/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- A Razorpay account (for payment integration)

### 1️⃣ Installation

```bash
cd cake-shop
npm install
```

### 2️⃣ Environment Setup

Create `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/cake_shop"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Razorpay (Optional)
NEXT_PUBLIC_RAZORPAY_KEY_ID="your-key-id"
RAZORPAY_SECRET_KEY="your-secret-key"
```

### 3️⃣ Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5️⃣ Demo Credentials

**Admin**
- Email: `admin@example.com`
- Password: `password123`
- URL: [http://localhost:3000/admin](http://localhost:3000/admin)

**Vendor**
- Email: `vendor@example.com`
- Password: `password123`
- URL: [http://localhost:3000/vendor](http://localhost:3000/vendor)

**Customer**
- Email: `customer@example.com`
- Password: `password123`

---

## 💾 Database Setup

### 20 Database Models

**User & Authentication**: User, Account, Notification  
**Vendor Management**: Vendor, VendorProfile, VendorLocation, VendorServiceArea, VendorRequest, VendorAnalytics  
**Product Management**: Cake, CakeCustomization, CakeImage  
**Order & Payment**: Order, OrderItem, Payment  
**Platform Management**: CouponCode, Dispute  
**Audit & Support**: AuditLog, SupportTicket, Review

---

## 🔐 Authentication & Roles

### Three User Roles

**Customer** - Browse, purchase, track orders, reviews  
**Vendor** - Manage products, orders, analytics, business info  
**Admin** - Manage vendors, orders, analytics, disputes, settings

---

## 🔌 API Routes

```
Authentication: POST /api/auth/{signup,login,logout}
Vendor APIs: /api/vendor/{profile,analytics,orders}
Admin APIs: /api/admin/{vendors,orders,analytics}
Cake APIs: GET/POST/PUT/DELETE /api/cakes
Order APIs: /api/orders/{create,status,cancel}
Payment: /api/split-payment, /api/webhooks/razorpay
Reviews: /api/reviews
Service Areas: /api/service-areas
```

---

## 👨‍💼 Admin Dashboard

| Page | Features |
|------|----------|
| Dashboard | KPI cards, revenue trend, order distribution, top vendors |
| Vendors | Vendor directory, filter, approve/reject, verify documents |
| Orders | Order list, real-time status, refunds, disputes |
| Analytics | Revenue trends, category distribution, growth metrics |
| Disputes | Complaint management, resolution workflow |
| Promotions | Coupon management, campaigns, analytics |
| Settings | Admin management, payment config, platform settings |

---

## 🏪 Vendor Dashboard

| Page | Features |
|------|----------|
| Dashboard | Quick stats, weekly analytics, order status, top products |
| Products | CRUD operations, categorization, search, analytics |
| Orders | Real-time list, status tracking, confirmation workflow |
| Analytics | Revenue/order trends, ratings, category performance |
| Profile | Business info, locations, service areas, documents |

---

## 👥 Customer Features

- **Browse & Search**: Advanced cake search and filtering
- **Shopping Cart**: Add/remove items, quantities, cart summary
- **Checkout**: Address selection, delivery time, payment, promo codes
- **Order Tracking**: Real-time status, delivery tracking, history
- **Profile**: Saved addresses, preferences, order history
- **Reviews**: Product and vendor ratings, review management

---

## ⚙️ Configuration

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="..."
RAZORPAY_SECRET_KEY="..."
SMTP_HOST="..."
SMTP_USER="..."
SMTP_PASS="..."
OPENAI_API_KEY="..."
```

---

## 🚀 Deployment

### Deploy to Vercel

```bash
npm i -g vercel
vercel
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
```

### Deploy to Other Platforms

**Docker**:
```bash
docker build -t cake-shop .
docker run -p 3000:3000 cake-shop
```

**Heroku**:
```bash
heroku create your-app
heroku addons:create heroku-postgresql:standard-0
git push heroku main
```

---

## 📚 Documentation

Comprehensive documentation included:
- **QUICK_START.md** - 5-minute setup guide
- **COMPLETE_GUIDE.md** - Deep dive into architecture
- **IMPLEMENTATION_SUMMARY.md** - Feature details
- **DASHBOARD_SETUP.md** - Technical setup
- **INDEX.md** - Documentation navigation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

**Database Connection Error**
```bash
npx prisma migrate reset
```

**Port Already in Use (Windows)**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies Issues**
```bash
rm -rf node_modules
npm install
npx prisma generate
```

---

## 📊 Project Statistics

- **Pages**: 20+
- **Components**: 30+
- **Database Models**: 20
- **API Routes**: 25+
- **Charts**: 10+
- **Code**: 3000+ lines
- **Documentation**: 5 comprehensive guides

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🎯 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced AI recommendations
- [ ] Live chat support
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Subscription plans
- [ ] Advanced reporting and BI
- [ ] Integration with logistics partners
- [ ] API rate limiting

---

## 🙌 Acknowledgments

- Next.js team
- Prisma for excellent ORM
- Tailwind CSS
- Community contributors

---

**Last Updated**: January 2026  
**Version**: 0.1.0
