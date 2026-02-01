# Cake Upload Feature Documentation

## Overview
This document describes the vendor cake upload feature implemented in the cake-shop website. Vendors can upload up to 4 cakes to their catalog after completing the onboarding process and receiving approval.

## Features

### 1. **Cake Upload Restrictions**
- **Maximum Cakes:** 4 cakes per vendor
- **Minimum Cakes:** 1 cake (for selling)
- **Images per Cake:** 1-4 images (minimum 1 required)
- **Only Approved Vendors:** Vendors must complete onboarding and be approved before uploading

### 2. **Cake Information Fields**

#### Required Fields
- **Cake Name** - The name of the cake
- **Category** - Select from predefined categories:
  - Cakes
  - Theme Cakes
  - Desserts
  - Birthday
  - Hampers
  - Anniversary
  - Occasions
  - Customized Cakes
  - Wedding
  - Engagement
  - Eggless
  - Sugar-Free
- **Base Price** - Starting price in rupees
- **Flavors** - At least 1 flavor required (e.g., Chocolate, Vanilla, Strawberry)
- **Toppings** - At least 1 topping option required (e.g., Sprinkles, Almonds)
- **Images** - 1-4 images (Cloudinary storage)

#### Optional Fields
- **About/Description** - Cake description and details
- **Available Sizes** - Custom sizes with prices (defaults to 0.5kg, 1kg, 2kg)
- **Customizable** - Toggle if cake can be customized

### 3. **Image Storage**
Images are stored in **Cloudinary** with the following structure:
```
cake-shop/vendors/{vendorId}/cakes/
```

Image upload includes:
- Automatic quality optimization
- Secure URL generation
- Support for PNG, JPG, GIF formats

## API Endpoints

### 1. **Upload Cake**
**Endpoint:** `POST /api/vendor/cakes/upload`

**Request:**
```
Content-Type: multipart/form-data

Fields:
- name (string) - Cake name *required
- description (string) - About/description
- category (string) - Cake category *required
- basePrice (number) - Base price *required
- flavors (JSON array) - List of flavors *required
- toppings (JSON array) - List of toppings *required
- availableSizes (JSON array) - Available sizes with prices
- isCustomizable (boolean) - Is cake customizable
- images (File[]) - 1-4 image files *required
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cake added successfully",
  "cake": {
    "id": "cake-123",
    "name": "Chocolate Truffle Cake",
    "category": "Cakes",
    "basePrice": 599,
    "images": ["https://cloudinary-url.jpg"]
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message",
  "details": "Additional details if available"
}
```

**Status Codes:**
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `403` - Vendor not approved or max cakes reached
- `500` - Server error

### 2. **Get Vendor's Cakes**
**Endpoint:** `GET /api/vendor/cakes`

**Response:**
```json
[
  {
    "id": "cake-123",
    "name": "Chocolate Truffle Cake",
    "category": "Cakes",
    "basePrice": 599,
    "description": "Rich chocolate cake...",
    "images": ["https://cloudinary-url.jpg"],
    "flavors": ["Chocolate"],
    "customOptions": {
      "toppings": ["Sprinkles", "Almonds"],
      "frostings": [],
      "messages": true
    },
    "isActive": true,
    "isCustomizable": true,
    "availableSizes": [
      { "size": "0.5kg", "price": 599 },
      { "size": "1kg", "price": 899 }
    ],
    "createdAt": "2025-01-31T10:00:00Z",
    "updatedAt": "2025-01-31T10:00:00Z"
  }
]
```

### 3. **Update Cake**
**Endpoint:** `PUT /api/vendor/cakes/{id}`

**Request:**
Same as upload, but all fields are optional

**Response:**
Similar to upload response

**Status Codes:**
- `200` - Success
- `404` - Cake not found
- `403` - Unauthorized (not the owner)
- `500` - Server error

### 4. **Delete Cake**
**Endpoint:** `DELETE /api/vendor/cakes/{id}`

**Response (Success):**
```json
{
  "success": true,
  "message": "Cake deleted successfully"
}
```

**Features:**
- Deletes Cloudinary images
- Removes from database
- Requires vendor ownership

## User Interface

### 1. **Upload Cake Page**
**Route:** `/vendor/cakes/upload`

Features:
- Verification status check
- Max cake limit indicator
- Form with all required fields
- Multi-image upload with preview
- Real-time validation
- Success/error notifications

### 2. **Vendor Dashboard**
**Route:** `/vendor`

Shows:
- Cake catalog section
- All uploaded cakes with images
- Edit/Delete buttons for each cake
- Remaining cake slots (e.g., 2/4)
- Quick action to upload new cake

### 3. **Products Page**
**Route:** `/vendor/products`

Shows:
- Grid view of all cakes
- Cake details (flavor, toppings, price)
- Edit/Delete functionality
- Verification status
- Max upload limit alerts

## Database Schema

### Cake Model
```prisma
model Cake {
  id              String   @id @default(cuid())
  vendorId        String
  vendor          Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  
  name            String
  slug            String
  description     String?
  basePrice       Float
  category        String
  
  images          String[]       // Cloudinary URLs
  flavors         String[]       // ["Chocolate", "Vanilla"]
  customOptions   Json?          // {toppings: [], frostings: [], messages: true}
  availableSizes  Json           // [{size: "1kg", price: 500}]
  
  isCustomizable  Boolean  @default(false)
  isActive        Boolean  @default(true)
  popularity      Int      @default(0)
  rating          Float    @default(0)
  reviewCount     Int      @default(0)
  
  reviews         CakeReview[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([vendorId, slug])
  @@index([vendorId])
}
```

## Validation Rules

### Server-Side Validation
- Vendor must be approved (`approvalStatus == 'approved'`)
- Maximum 4 cakes per vendor
- Minimum 1 image required
- Maximum 4 images per cake
- Required fields: name, category, basePrice, flavors, toppings
- Images must be valid file types (image/*)

### Client-Side Validation
- Real-time field validation
- Image preview before upload
- File size validation
- Image count validation
- Format validation (png, jpg, gif)

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | Not logged in or not a vendor | Log in and verify account type |
| "Vendor must be approved" | Onboarding not completed | Complete onboarding and wait for approval |
| "Maximum 4 cakes allowed" | Trying to add more than 4 cakes | Delete existing cakes or wait |
| "At least 1 image required" | No images selected | Upload at least 1 image |
| "Maximum 4 images allowed" | Too many images | Remove extra images |
| "Missing required fields" | Form incomplete | Fill all required fields |
| "Failed to upload cake" | Server error | Retry or contact support |

## Configuration

### Environment Variables
Required for Cloudinary integration:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Flow Diagram

```
Vendor Login
    ↓
Complete Onboarding
    ↓
Admin Reviews & Approves
    ↓
Vendor Access Upload Page (/vendor/cakes/upload)
    ↓
Fill Cake Form
    ↓
Upload Images (Cloudinary)
    ↓
Submit
    ↓
Cake Added to Database
    ↓
Visible on Dashboard & Products Page
    ↓
Can Edit/Delete Anytime
```

## File Locations

### Components
- `src/components/vendor/CakeUploadForm.tsx` - Upload form component

### Pages
- `src/app/vendor/cakes/upload/page.tsx` - Upload cake page
- `src/app/vendor/page.tsx` - Dashboard with cake catalog
- `src/app/vendor/products/page.tsx` - Manage cakes page

### API Routes
- `src/app/api/vendor/cakes/upload/route.ts` - Upload endpoint
- `src/app/api/vendor/cakes/route.ts` - Get cakes endpoint
- `src/app/api/vendor/cakes/[id]/route.ts` - Edit/Delete endpoints

## Security Features

1. **Authentication:** Requires valid session
2. **Authorization:** Vendor can only manage their own cakes
3. **Approval Check:** Only approved vendors can upload
4. **Input Validation:** Server-side validation on all inputs
5. **Image Security:** Cloudinary handles image storage safely
6. **Rate Limiting:** Can be added if needed

## Future Enhancements

1. Cake edit page with preview
2. Bulk image upload
3. Advanced image editing
4. Cake analytics (views, orders)
5. Stock management
6. Discount/promotional pricing
7. Cake variants
8. Customer reviews display

## Support

For issues or questions:
1. Check error messages in the UI
2. Review browser console for logs
3. Check server logs for API errors
4. Contact admin through support system
