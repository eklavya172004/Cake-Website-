# OpenAI Integration Complete Guide

## Quick Start (5 minutes)

### Step 1: Get OpenAI API Key (2 minutes)
1. Visit: https://platform.openai.com/signup
2. Create account or login
3. Add payment method (Billing > Billing overview > Add card)
4. Go to: https://platform.openai.com/api/keys
5. Click "Create new secret key"
6. Copy the key (format: `sk_...`)

### Step 2: Add Key to Your Project (1 minute)
Create `cake-shop/.env.local` file:
```env
OPENAI_API_KEY=sk_your_key_here
```

### Step 3: Install OpenAI Package (1 minute)
In `cake-shop` folder, run:
```bash
npm install openai
```

### Step 4: Restart Development Server (1 minute)
```bash
npm run dev
```

## Testing the Integration

1. Go to any cake detail page
2. Scroll to "AI-Generated Preview" section
3. Click "Generate AI Preview"
4. ✅ Should generate a professional cake image using DALL-E 3

## Architecture Overview

```
User clicks "Generate AI Preview"
         ↓
AICakePreview Component
  (src/components/cakes/AICakePreview.tsx)
         ↓
API Route: /api/generate-cake-image-openai
  (src/app/api/generate-cake-image-openai/route.ts)
         ↓
OpenAI DALL-E 3 API
         ↓
Returns: High-quality AI-generated cake image
         ↓
Display in Component with download option
```

## What Changed?

### Files Modified:
1. **package.json** - Added `openai` dependency
2. **AICakePreview.tsx** - Changed API endpoint from `/api/generate-cake-image` to `/api/generate-cake-image-openai`

### Files Created:
1. **api/generate-cake-image-openai/route.ts** - New OpenAI integration endpoint
2. **.env.local.example** - Environment template
3. **OPENAI_SETUP.md** - This setup guide

## Pricing Breakdown

### DALL-E 3 Costs (2026 pricing):
- **1024x1024 (standard quality)**: $0.080 per image ✅ We use this
- **1024x1792 (standard quality)**: $0.120 per image
- **1792x1024 (standard quality)**: $0.120 per image
- **1024x1024 (HD quality)**: $0.160 per image
- **1024x1792 (HD quality)**: $0.240 per image
- **1792x1024 (HD quality)**: $0.240 per image

### Example Costs:
| Generated Images | Cost |
|---|---|
| 10 | $0.80 |
| 50 | $4.00 |
| 100 | $8.00 |
| 500 | $40.00 |
| 1000 | $80.00 |

### Cost Management:
1. **Set Usage Limits**: https://platform.openai.com/account/billing/limits
   - Go to "Hard limit" and set max monthly spend
   - Get email alerts when approaching limit

2. **Monitor Usage**: https://platform.openai.com/account/billing/overview
   - Check daily/monthly usage
   - See cost breakdown by model

3. **Optimize Generation**:
   - Only generate when user clicks button
   - Reuse generated images (caching)
   - Warn users before generation

## Features Implemented

✅ **AI-Powered Cake Preview**
- Uses OpenAI DALL-E 3 for professional results
- Generates based on: flavor, size, toppings, frosting, custom message

✅ **Detailed Prompt Engineering**
- Flavor-specific descriptions (chocolate, vanilla, strawberry, etc.)
- Size-specific descriptions (small, medium, large)
- Frosting type mapping
- Professional photography style prompts

✅ **Error Handling**
- API key validation
- Rate limit handling
- Helpful error messages
- Graceful fallbacks

✅ **User Experience**
- Loading states with spinner
- Regenerate button to get new designs
- Download image functionality
- Clear error messages

## API Response Format

### Success Response:
```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "success": true,
  "method": "openai-dall-e-3",
  "revisedPrompt": "A professional bakery-quality photograph..."
}
```

### Error Response:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Prompt Examples

The system generates specific prompts like:

**For Chocolate Cake:**
```
A professional bakery-quality photograph of a stunning large rich dark chocolate cake. 
The cake has rich chocolate buttercream frosting with an elegant finish. 
It features elegant decorations and professional presentation. 
The cake displays the text "Happy Birthday!" written in elegant script or lettering on top.
The cake is displayed on a clean white plate or cake stand against a soft, blurred background.
Professional studio lighting, shallow depth of field, bakery showcase style, 8k quality, mouth-watering presentation.
```

**For Strawberry with Toppings:**
```
A professional bakery-quality photograph of a stunning medium fresh strawberry cake.
The cake has silky swiss meringue frosting with an elegant finish.
It is decorated with fresh strawberries, whipped cream, and chocolate shavings.
The cake is displayed on a clean white plate or cake stand...
```

## Troubleshooting

### ❌ "OpenAI API key not configured"
**Solution:**
- Create `.env.local` in `cake-shop` folder
- Add your API key: `OPENAI_API_KEY=sk_...`
- Restart dev server

### ❌ "Invalid OpenAI API key"
**Solution:**
- Go to https://platform.openai.com/api/keys
- Check key starts with `sk_`
- Verify key hasn't expired
- Try creating a new key

### ❌ "Rate limit exceeded"
**Solution:**
- Wait a moment, then retry
- Check usage: https://platform.openai.com/account/billing/overview
- Contact OpenAI if consistently limited

### ❌ "Insufficient quota"
**Solution:**
- Add payment method to OpenAI account
- Check billing: https://platform.openai.com/account/billing/overview
- Increase usage limit if desired

### ❌ Image generates but looks wrong
**Solution:**
- Try regenerating (click "Regenerate" button)
- Adjust cake description/flavor
- OpenAI may have different interpretation

## Advanced Configuration

### Custom Image Sizes
Edit `src/app/api/generate-cake-image-openai/route.ts`:
```typescript
const response = await openai.images.generate({
  size: '1024x1792', // Change to 1024x1792 or 1792x1024
  quality: 'hd',     // Change to 'hd' for higher quality (costs 2x)
  // ... rest of config
});
```

### Custom Prompt Style
Modify the `buildCakePrompt()` function to adjust how prompts are created:
- Change photography style
- Adjust detail level
- Customize flavor descriptions

## Security Checklist

✅ API key in `.env.local`
✅ `.env.local` in `.gitignore`
✅ Never commit sensitive keys
✅ API key accessible only server-side
✅ Validate inputs before sending to OpenAI
✅ Monitor usage regularly
✅ Use rate limiting if needed

## Next Steps (Optional)

1. **Cache Images**: Store generated images in database
2. **Watermark**: Add your shop logo to generated images
3. **Custom Styles**: Let users choose photography style
4. **Bulk Generation**: Generate multiple variations
5. **Analytics**: Track which configurations are popular

## Support

- OpenAI Docs: https://platform.openai.com/docs
- API Reference: https://platform.openai.com/docs/api-reference
- DALL-E Guide: https://platform.openai.com/docs/guides/images

---

**Need help?** Check the console for detailed error messages when generating fails.
