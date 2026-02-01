# Admin Dashboard Navigation Guide

## 🗺️ Complete URL Map

### **Main Entry Points**

| Feature | URL | Description |
|---------|-----|-------------|
| Admin Dashboard | `/admin` | Main admin home page with stats |
| Vendor List | `/admin/vendors` | All vendors in table format |
| Vendor Details | `/admin/vendors/[id]` | Complete vendor management page |

---

## 📍 Navigation Paths

### **From Admin Dashboard `/admin`**
```
Dashboard
  └─ Click "Vendors" in sidebar
      └─ Vendor List Page (/admin/vendors)
```

### **From Vendor List `/admin/vendors`**
```
Vendors List
  ├─ Click Eye Icon (👁️)
  │   └─ Vendor Details Page (/admin/vendors/[id])
  │
  └─ Click Chevron (⌄) 
      └─ Expand Inline Details (Stay on same page)
```

### **From Vendor Details `/admin/vendors/[id]`**
```
Vendor Details Page
  ├─ Details Tab (Active by default)
  │   └─ View vendor info, business details, status
  │
  ├─ Products Tab
  │   ├─ View all products
  │   ├─ Add Product Modal
  │   │   └─ Fill form, click "Create Product"
  │   ├─ Edit Product Modal
  │   │   └─ Update fields, click "Save Changes"
  │   └─ Delete Product (with confirmation)
  │
  └─ Orders Tab
      ├─ View all orders
      ├─ Click to expand order details
      └─ Edit Order
          ├─ Change status from dropdown
          ├─ Add vendor notes
          └─ Click "Save Changes"
```

---

## 🔗 Direct URLs

### **Vendor Details**
```
/admin/vendors/ABC123DEF456
```
Replace `ABC123DEF456` with actual vendor ID

### **API Endpoints** (for reference)
```
GET /api/admin/vendors/ABC123DEF456
GET /api/admin/vendors/ABC123DEF456/products?page=1&limit=10
GET /api/admin/vendors/ABC123DEF456/orders?page=1&limit=10
```

---

## 🎯 Common Tasks & Navigation

### **Task 1: View All Vendors**
```
Step 1: Go to /admin/vendors
Step 2: See all vendors in table
Result: Vendor list displayed with stats
```

### **Task 2: View Specific Vendor Details**
```
Step 1: Go to /admin/vendors
Step 2: Click Eye Icon next to vendor name
Step 3: Redirected to /admin/vendors/[id]
Result: Vendor details page with tabs
```

### **Task 3: Add New Product to Vendor**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Products Tab"
Step 3: Click "Add Product" button
Step 4: Fill form in modal
Step 5: Click "Create Product"
Result: New product added to vendor
```

### **Task 4: Edit Existing Product**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Products Tab"
Step 3: Click Pencil Icon (✏️) on product
Step 4: Update fields in modal
Step 5: Click "Save Changes"
Result: Product updated
```

### **Task 5: Delete Product**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Products Tab"
Step 3: Click Trash Icon (🗑️) on product
Step 4: Confirm deletion in dialog
Result: Product deleted
```

### **Task 6: Update Order Status**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Orders Tab"
Step 3: Click on order to expand
Step 4: Click "Edit Order" button
Step 5: Select new status from dropdown
Step 6: Optionally add notes
Step 7: Click "Save Changes"
Result: Order status updated
```

### **Task 7: Filter Products by Status**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Products Tab"
Step 3: Click filter button (All/Active/Inactive)
Result: Products filtered by status
```

### **Task 8: Filter Orders by Status**
```
Step 1: Go to /admin/vendors/[id]
Step 2: Click "Orders Tab"
Step 3: Click status filter button
Result: Orders filtered by status
```

---

## 🏗️ Page Structure

### **Vendor List Page (`/admin/vendors`)**
```
┌─────────────────────────────────┐
│  Header: Vendor Management      │
│  Stats: Total, Approved, etc.   │
│                                 │
│  [Search] [Filter Status] [Filter Verification]
│                                 │
│  ┌─────────────────────────────┐│
│  │ Vendor Table                ││
│  ├─────────────────────────────┤│
│  │ Name | Owner | Orders | ... ││
│  ├─────────────────────────────┤│
│  │ Vendor 1 | Actions (👁️⌄✓✗)││
│  │ Vendor 2 | Actions          ││
│  │ Vendor 3 | Actions          ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘
```

### **Vendor Detail Page (`/admin/vendors/[id]`)**
```
┌─────────────────────────────────────┐
│ ← Back | Vendor Name | Edit Button   │
│ Status Badges: Active | Approved...  │
│                                     │
│ Quick Stats Cards                   │
│ ┌────┬────┬────┬────┐              │
│ │Orders│Products│Revenue│Rating│    │
│ └────┴────┴────┴────┘              │
│                                     │
│ [Details] [Products] [Orders] Tabs  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Tab Content (depends on tab)    │ │
│ │                                 │ │
│ │ Details Tab: Vendor info        │ │
│ │ Products Tab: Product list      │ │
│ │ Orders Tab: Order list          │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### **Products Tab Content**
```
┌─────────────────────────────────┐
│ [All] [Active] [Inactive]       │
│ [+ Add Product] (right aligned) │
│                                 │
│ ┌──────────────────────────────┐│
│ │ Product 1                    ││
│ │ Description...               ││
│ │ Price: ₹X | Rating: ⭐X     ││
│ │ [Edit] [Delete] [Toggle]     ││
│ │ [Show More ▼]                ││
│ └──────────────────────────────┘│
│                                 │
│ ┌──────────────────────────────┐│
│ │ Product 2                    ││
│ │ ...                          ││
│ └──────────────────────────────┘│
└─────────────────────────────────┘
```

### **Orders Tab Content**
```
┌──────────────────────────────────┐
│ [All] [Pending] [Confirmed] ...  │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Order #ORD-2025-0001         │ │
│ │ Status: Pending | Paid       │ │
│ │ Customer: John | ₹1,500      │ │
│ │ [Date] [↓ Expand]            │ │
│ │                              │ │
│ │ [Expanded Order Details]     │ │
│ │ - Items list                 │ │
│ │ - Pricing breakdown          │ │
│ │ - Customer info              │ │
│ │ - [Edit Order Button]        │ │
│ └──────────────────────────────┘ │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ Order #ORD-2025-0002         │ │
│ │ ...                          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 🖱️ Button & Icon Legend

| Icon | Meaning | Action |
|------|---------|--------|
| 👁️ | View | Navigate to detail page |
| ⌄ | Expand | Show more details inline |
| ✏️ | Edit | Open edit modal |
| 🗑️ | Delete | Remove item (with confirmation) |
| ⟲ | Toggle | Switch active/inactive status |
| ← | Back | Return to previous page |
| ✓ | Approve | Approve vendor |
| ✗ | Reject | Reject vendor |

---

## 📊 Breadcrumb Navigation

### **While on Vendor Details Page**
```
Admin > Vendors > Vendor Name [current page]
←             ↓
Click to      Navigate directly
go back       to vendor list
```

---

## 🔄 Navigation Between Tabs

### **Within Vendor Detail Page**
```
Details Tab (View info)
    ↓ Click
Products Tab (Manage products)
    ↓ Click
Orders Tab (Manage orders)
    ↓ Click
Back to Details Tab
```

All without leaving the page!

---

## 💾 Data Persistence

When you navigate:
- ✅ Data is saved in database
- ✅ Products persist when switching tabs
- ✅ Orders persist when switching tabs
- ✅ Filter selections reset when page reloads
- ✅ Modal forms don't save until you click Submit

---

## 🌐 Browser Back Button

- ✅ Works from Vendor Details back to Vendor List
- ✅ Works from expanded order back to order list
- ✅ Doesn't work within tabs (use tab buttons)
- ✅ Handles browser history correctly

---

## 📱 Mobile Navigation

### **Vendor List**
- Table converts to cards
- Each card shows vendor info
- Buttons stack vertically
- Filters wrap to new lines

### **Vendor Details**
- Tabs are scrollable horizontally
- Cards are full width
- Buttons stack vertically
- Modals are full-screen or larger

---

## 🎯 Quick Links for Common Tasks

### **Add Product to Vendor "ABC123"**
```
1. /admin/vendors/ABC123
2. Products Tab
3. Add Product button
```

### **Change Order Status for Vendor "XYZ789"**
```
1. /admin/vendors/XYZ789
2. Orders Tab
3. Click order to expand
4. Edit Order button
```

### **View All Vendors**
```
Direct URL: /admin/vendors
```

---

## ✨ Pro Tips

1. **Use Eye Icon** to navigate to vendor details with one click
2. **Use Chevron** to expand inline if you only need to see some details
3. **Use Tabs** to switch between different types of information
4. **Use Filters** to quickly find specific products or orders
5. **Use Modals** for focused data entry without leaving page
6. **Use Status Badges** for quick visual understanding of state
7. **Use Browser Back** button to return to vendor list
8. **Use Keyboard** Tab key to navigate form fields

---

This complete navigation guide should help you and your team easily access all features of the admin vendor dashboard!
