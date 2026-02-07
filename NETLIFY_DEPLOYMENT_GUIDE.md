# Netlify Deployment Guide for PurblePalace

## Prerequisites
- GitHub account (repository already pushed)
- Netlify account (sign up at https://app.netlify.com)
- All environment variables ready

## Step 1: Create Netlify Account & Connect GitHub

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"New site from Git"**
3. Choose **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select your repository: **eklavya172004/Cake-Website-**
6. Click **"Connect"**

## Step 2: Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

### Basic Settings
- **Base directory**: `cake-shop` (where your package.json is located)
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### If Auto-Detection Fails:
1. Go to **Site Settings** → **Build & Deploy** → **Build Settings**
2. Set values manually:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Step 3: Configure Environment Variables

1. In Netlify dashboard, go to **Site Settings** → **Build & Deploy** → **Environment**
2. Click **"Edit variables"**
3. Add these environment variables:

```
DATABASE_URL=your_neondb_connection_string
NEXTAUTH_SECRET=your_secure_secret_key
NEXTAUTH_URL=https://your-netlify-domain.netlify.app
NEXT_PUBLIC_NEXTAUTH_URL=https://your-netlify-domain.netlify.app
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_key
RAZORPAY_SECRET=your_razorpay_secret_key
RAZORPAY_ACCOUNT_ID=your_razorpay_account_id
```

4. Click **"Save"**

## Step 4: Configure Next.js Runtime

Create or update `netlify.toml` in your project root:

```toml
[build]
  base = "cake-shop"
  command = "npm run build"
  publish = ".next"

[functions]
  node_bundler = "esbuild"
  external_node_modules = ["sharp"]

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "npm run dev"
  port = 3000
```

Place this file at: `g:/CAKE-WEBSITE/netlify.toml`

## Step 5: Update Build Configuration for Next.js

1. Go to **Site Settings** → **Build & Deploy** → **Build Settings**
2. Click **"Edit settings"**
3. Verify:
   - **Base directory**: `cake-shop`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: `cake-shop/functions` (or leave empty)

## Step 6: Configure Node Version

Create `.nvmrc` in your project root:

```
18.17.1
```

Or set in netlify.toml:
```toml
[build.environment]
  NODE_VERSION = "18.17.1"
```

## Step 7: Deploy

1. **Automatic Deploy**: Push changes to GitHub main branch
   - Netlify will automatically build and deploy
   
2. **Manual Deploy**: In Netlify dashboard
   - Click **"Deploys"** → **"Trigger deploy"** → **"Deploy site"**

## Step 8: Configure Custom Domain (Optional)

1. Go to **Site Settings** → **Domain Management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., purblepalace.com)
4. Follow DNS configuration instructions

## Step 9: Update Environment Variables with Live URL

Once deployed, update these variables with your actual Netlify URL:

```
NEXTAUTH_URL=https://your-live-domain.netlify.app
NEXT_PUBLIC_NEXTAUTH_URL=https://your-live-domain.netlify.app
```

## Step 10: Testing Post-Deployment

### Test Checklist:
- [ ] Homepage loads without errors
- [ ] Search functionality works
- [ ] Sign-up/Login works
- [ ] Vendor can upload cakes
- [ ] Category selection works
- [ ] Image generation works (OpenAI DALL-E)
- [ ] Cloudinary images load
- [ ] Search and filtering works
- [ ] Checkout process works
- [ ] Payment gateway initializes (Razorpay)
- [ ] Order tracking available
- [ ] Admin dashboard accessible
- [ ] Vendor dashboard functional

## Step 11: Monitor Deployment

1. **Check Build Logs**: Deploys → Select deploy → View logs
2. **Enable Analytics**: Site Settings → Analytics
3. **Set Up Error Tracking**: Integrations → Add Sentry (optional)

## Common Issues & Solutions

### Issue: Build Fails with "Module not found"

**Solution**:
```bash
# Reinstall dependencies
npm install

# Rebuild locally to verify
npm run build

# Push to GitHub
git add .
git commit -m "Fix dependencies"
git push
```

### Issue: "Cannot find schema.prisma"

**Solution**: Update base directory to `cake-shop` in Netlify settings

### Issue: Environment Variables Not Loading

**Solution**:
1. Redeploy after adding variables: **Deploys** → **Trigger deploy**
2. Verify variables in **Build logs**
3. Check NEXT_PUBLIC_ prefix for client-side variables

### Issue: Database Connection Timeout

**Solution**:
1. Verify DATABASE_URL is correct in NeonDB dashboard
2. Whitelist Netlify IP addresses in database settings
3. Test connection locally first

### Issue: OpenAI Image Generation Fails

**Solution**:
1. Verify OPENAI_API_KEY is valid
2. Check OpenAI account has sufficient credits
3. Review build logs for specific errors

### Issue: Cloudinary Upload Fails

**Solution**:
1. Verify Cloudinary credentials (CLOUD_NAME, API_KEY, API_SECRET)
2. Check folder path in code (`cake-shop/generated-images`)
3. Verify Cloudinary account has upload permissions

## Rollback Previous Deployment

1. Go to **Deploys**
2. Find previous successful deployment
3. Click **"Publish deploy"**
4. Confirm rollback

## Enable Preview Deployments

1. **Site Settings** → **Build & Deploy** → **Deploy Contexts**
2. Enable:
   - Branch deploys: `Deploy all commits`
   - Pull request previews: `Deploy pull requests`

This allows testing on staging URLs before merging to main.

## Performance Optimization

1. **Edge Functions**: Set up for faster response times
2. **Image Optimization**: Already using Cloudinary
3. **Caching**: Configure in netlify.toml
4. **CDN**: Netlify's CDN automatically caches assets

## Post-Deployment Checklist

- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] All environment variables set
- [ ] First deployment successful
- [ ] Custom domain configured (if desired)
- [ ] SSL certificate active
- [ ] Database migrations applied
- [ ] All features tested
- [ ] Analytics enabled
- [ ] Error tracking enabled (optional)
- [ ] Backup strategy in place

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Next.js + Netlify**: https://docs.netlify.com/integrations/frameworks/next-js/
- **Environment Variables**: https://docs.netlify.com/configure-builds/environment-variables/
- **Troubleshooting**: https://docs.netlify.com/support/common-issues/

## Your Project Status

✅ **Build Ready**: Project compiles successfully (65s, 78 pages)
✅ **GitHub Ready**: Code pushed to repository
✅ **Database Ready**: PostgreSQL (NeonDB) configured
✅ **API Keys Ready**: OpenAI, Cloudinary, Razorpay configured
✅ **Environment Variables**: All documented above

**Next Step**: Follow Step 1-4 to complete Netlify deployment!
