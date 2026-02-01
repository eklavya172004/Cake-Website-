# Cake Upload Feature - Quick Reference Guide

## 🚀 Quick Start

### For Vendors
1. **Navigate to:** `/vendor/cakes/upload`
2. **Fill in:**
   - Cake name (required)
   - Category (required)
   - Price in rupees (required)
   - At least 1 flavor (required)
   - At least 1 topping (required)
   - 1-4 images (required)
3. **Optional:** Description, custom sizes, customizable flag
4. **Click:** "Upload Cake"
5. **See result:** Cake appears on Dashboard & Products Page

---

## 📍 File Locations

### API Endpoints
```
/src/app/api/vendor/cakes/
├── upload/route.ts          (POST - Create)
├── route.ts                 (GET - Read)
└── [id]/route.ts            (PUT/DELETE - Update/Delete)
```

### Pages
```
/src/app/vendor/
├── cakes/upload/page.tsx    (Upload form page)
├── page.tsx                 (Dashboard with cake section)
└── products/page.tsx        (Manage cakes page)
```

### Components
```
/src/components/vendor/
└── CakeUploadForm.tsx       (Reusable upload form)
```

### Documentation
```
/cake-shop/
├── CAKE_UPLOAD_FEATURE.md                  (Technical docs)
├── CAKE_UPLOAD_QUICKSTART.md              (Vendor guide)
├── CAKE_UPLOAD_IMPLEMENTATION_SUMMARY.md  (Overview)
├── CAKE_UPLOAD_ARCHITECTURE.md            (System design)
└── CAKE_UPLOAD_CHECKLIST.md               (This checklist)
```

---

## 🔧 API Quick Reference

### Upload Cake
```bash
POST /api/vendor/cakes/upload
Content-Type: multipart/form-data

# Fields:
name=<string>                    # Required
category=<string>               # Required
basePrice=<number>              # Required
flavors=<JSON array>            # Required
toppings=<JSON array>           # Required
description=<string>            # Optional
availableSizes=<JSON array>     # Optional
isCustomizable=<true|false>     # Optional
images=<File[1-4]>              # Required: 1-4 files
```

### Get Vendor Cakes
```bash
GET /api/vendor/cakes
# Returns: Array of cake objects
```

### Update Cake
```bash
PUT /api/vendor/cakes/{id}
Content-Type: multipart/form-data
# Same as POST but all fields optional
```

### Delete Cake
```bash
DELETE /api/vendor/cakes/{id}
# Returns: Success/error message
```

---

## 🎯 Key Limits

| Constraint | Limit |
|-----------|-------|
| Max cakes per vendor | 4 |
| Min cakes to sell | 1 |
| Min images per cake | 1 |
| Max images per cake | 4 |
| Max flavors per cake | 10 |
| Max toppings per cake | 10 |
| Categories available | 12 |

---

## 📊 Database Schema (Cake Model)

```typescript
{
  id: string                  // Auto-generated
  vendorId: string            // Foreign key
  name: string                // Cake name
  slug: string                // Auto-generated from name
  description?: string        // Optional about text
  basePrice: number           // Base price in rupees
  category: string            // Selected category
  images: string[]            // 1-4 Cloudinary URLs
  flavors: string[]           // Custom flavors
  customOptions: {
    toppings: string[]        // Custom toppings
    frostings: string[]       // Optional
    messages: boolean         // Can add messages?
  }
  availableSizes: Array<{
    size: string
    price: number
  }>
  isCustomizable: boolean     // Default: false
  isActive: boolean           // Default: true
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔐 Security Checklist

- ✅ Vendor must be logged in
- ✅ Vendor must be approved (`approvalStatus === 'approved'`)
- ✅ Max 4 cakes per vendor enforced
- ✅ Vendor ownership verified for edit/delete
- ✅ Input validation on all fields
- ✅ File type validation (images only)
- ✅ Image count validation
- ✅ No sensitive data in error messages

---

## 🛠️ Environment Setup

### Required Variables
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Image Storage Path
```
/cake-shop/vendors/{vendorId}/cakes/
```

---

## 🎨 Categories

1. Cakes
2. Theme Cakes
3. Desserts
4. Birthday
5. Hampers
6. Anniversary
7. Occasions
8. Customized Cakes
9. Wedding
10. Engagement
11. Eggless
12. Sugar-Free

---

## 🧪 Testing Scenarios

### Happy Path
```
1. Login as vendor
2. Go to /vendor/cakes/upload
3. Fill all required fields
4. Upload 1-4 images
5. Click "Upload Cake"
6. See success message
7. Cake visible on dashboard
```

### Error Cases
```
NOT APPROVED:
- Show yellow alert
- Block upload form
- Link to onboarding

MAX CAKES (4):
- Show warning
- Disable upload
- Suggest deleting cakes

MISSING FIELD:
- Show red validation error
- Prevent submission

TOO MANY IMAGES:
- Show error alert
- Allow removing images

NO IMAGES:
- Show error
- Require 1+ image
```

---

## 📱 Responsive Breakpoints

```
Mobile    (<768px)   → Single column
Tablet    (768-1024) → 2 columns
Desktop   (>1024px)  → 3-4 columns
```

---

## 🔄 Common Tasks

### Upload a Cake
1. Click "Upload Cake" in sidebar
2. Fill form fields
3. Upload images
4. Click "Upload Cake"
5. Done!

### Edit a Cake
1. Go to Dashboard or Products page
2. Find cake
3. Click "Edit" button
4. Modify details
5. Save changes

### Delete a Cake
1. Go to Dashboard or Products page
2. Find cake
3. Click "Delete" button
4. Confirm deletion
5. Cake removed

### View All Cakes
1. Go to Dashboard `/vendor`
2. Scroll to "Your Cakes Catalog"
3. See all cakes in grid
4. View details and actions

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't upload | Check if vendor is approved |
| Says "max 4 cakes" | Delete a cake first |
| Images not uploading | Check internet, file size |
| Form won't submit | Fill all required fields |
| No image previews | Refresh page, try again |
| Delete not working | Confirm the delete dialog |

---

## 📞 Support Resources

1. **Technical Docs:** `CAKE_UPLOAD_FEATURE.md`
2. **Vendor Guide:** `CAKE_UPLOAD_QUICKSTART.md`
3. **Architecture:** `CAKE_UPLOAD_ARCHITECTURE.md`
4. **Implementation:** `CAKE_UPLOAD_IMPLEMENTATION_SUMMARY.md`

---

## ⚡ Performance Tips

1. **Resize images** before upload (under 5MB ideal)
2. **Use good lighting** in photos
3. **Upload one cake at a time** for stability
4. **Refresh page** if stuck
5. **Clear browser cache** if issues persist

---

## 🎯 Feature Highlights

✨ **What's New:**
- Upload up to 4 cakes per vendor
- Custom flavors and toppings
- Multi-image upload (1-4 images)
- Cloudinary storage
- Dashboard cake catalog
- Easy edit/delete
- Full form validation
- Mobile responsive

---

## 📋 Before Going Live

- [ ] Cloudinary account setup
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Test upload flow end-to-end
- [ ] Test edit/delete functionality
- [ ] Verify image storage
- [ ] Test on mobile devices
- [ ] Check error messages
- [ ] Review documentation
- [ ] Brief vendors on new feature

---

## 🎉 Success Indicators

✅ Vendors can upload cakes  
✅ Images stored in Cloudinary  
✅ Cakes visible on dashboard  
✅ Edit/delete functionality works  
✅ Form validates correctly  
✅ Errors display properly  
✅ Mobile responsive  
✅ No console errors  

---

## 🔗 Related Routes

| Route | Purpose |
|-------|---------|
| `/vendor` | Dashboard with cakes |
| `/vendor/cakes/upload` | Upload new cake |
| `/vendor/products` | Manage cakes |
| `/vendor/orders` | View orders |
| `/vendor/profile` | Edit profile |
| `/vendor/onboarding` | Onboarding form |

---

## 💡 Pro Tips for Vendors

1. **Use quality photos** - Better photos = more orders
2. **Be descriptive** - Tell what makes your cake special
3. **Competitive pricing** - Check market rates
4. **Multiple flavors** - Offer variety
5. **Upload all 4 slots** - More cakes = more visibility
6. **Keep fresh** - Update regularly
7. **Respond quickly** - Accept orders fast
8. **Get reviews** - Encourage customer feedback

---

**Version:** 1.0  
**Last Updated:** January 31, 2026  
**Status:** ✅ Complete & Ready
