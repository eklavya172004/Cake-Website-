# Cloudinary Integration Setup Guide

This guide explains how to set up Cloudinary for storing vendor documents in the cake shop.

## What is Cloudinary?

Cloudinary is a cloud-based media management platform that allows you to:
- Store and manage media files (images, PDFs, documents)
- Serve optimized content from CDN globally
- Get secure URLs for stored files
- Manage storage and bandwidth

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Click "Sign Up Free"
3. Complete the registration process
4. Verify your email

## Step 2: Get Your API Credentials

1. Log in to your Cloudinary dashboard: [https://cloudinary.com/console](https://cloudinary.com/console)
2. You'll see your **Cloud Name** and **API Key** displayed at the top
3. For **API Secret**, click on "Settings" → "API Keys" section
4. Copy all three credentials

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your Cloudinary credentials to `.env.local`:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

**Important Notes:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is public (used in frontend)
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` should be kept secret (server-side only)
- Never commit `.env.local` to version control

## Step 4: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to the vendor onboarding form at `/vendor/onboarding`

3. Upload business proof and address proof documents

4. Submit the form

5. Verify documents were uploaded to Cloudinary:
   - Go to your Cloudinary dashboard
   - Click "Media Library"
   - Look for `vendor-documents` folder with your uploads
   - You should see the uploaded files organized by vendor ID

## How It Works

### Document Upload Flow

1. **Frontend** (`/src/app/vendor/onboarding/page.tsx`)
   - User selects and uploads documents
   - Form sends FormData with file and vendor information

2. **Backend** (`/src/app/api/vendor/onboarding/route.ts`)
   - Receives files from the form
   - Uploads each file to Cloudinary using `cloudinary.uploader.upload_stream()`
   - Gets back secure URLs for uploaded files
   - Stores URLs in database (not local files)

3. **Database** (Prisma)
   - Stores Cloudinary secure URLs in `VendorProfile.businessProof` and `VendorProfile.addressProof`
   - URLs are accessible anywhere

### Benefits

- **No server storage needed** - Files stored in cloud
- **Security** - Files accessible via secure URLs only
- **Global CDN** - Fast delivery worldwide
- **Easy management** - View/delete files from Cloudinary dashboard
- **Scalability** - Unlimited storage (within plan limits)

## File Organization in Cloudinary

Documents are organized as:
```
vendor-documents/
  ├── vendor-id-1/
  │   ├── business-proof-1234567890
  │   └── address-proof-1234567891
  ├── vendor-id-2/
  │   ├── business-proof-1234567892
  │   └── address-proof-1234567893
```

This makes it easy to:
- Find all documents for a specific vendor
- Delete vendor documents easily
- Monitor storage usage per vendor

## Admin Dashboard Integration

The admin vendor management dashboard (`/src/app/admin/vendors`) displays:
- Document links that open the Cloudinary secure URLs
- Vendor details with document preview capability
- Approve/Reject functionality

## Troubleshooting

### Documents not uploading?
1. Check API credentials in `.env.local` are correct
2. Ensure `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is public (NEXT_PUBLIC_ prefix)
3. Check browser console for errors
4. Check server logs for upload errors

### Can't access uploaded documents?
1. Verify the URLs are correct in database
2. Check Cloudinary dashboard to see if files were uploaded
3. Ensure your Cloudinary account has active storage quota

### Build error with Cloudinary?
1. Install dependencies: `npm install`
2. Restart dev server: `npm run dev`
3. Check that `cloudinary` package is in `package.json`

## Cloudinary Pricing

- **Free tier**: 25 GB storage, 25 GB monthly bandwidth
- Suitable for small to medium business
- Upgrade plans available for higher usage

For more details, visit [Cloudinary Pricing](https://cloudinary.com/pricing)

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use API Secret on server only** - Never expose in frontend code
3. **Restrict upload permissions** - Use unsigned uploads for limited permissions
4. **Set expiration** - Consider setting document expiration dates
5. **Monitor usage** - Check Cloudinary dashboard for unusual activity

## Additional Resources

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
