# OpenAI Integration Guide for Cake Preview Generation

## Step 1: Get OpenAI API Key

### Option A: New Account
1. Go to https://platform.openai.com/signup
2. Sign up with email or Google/Microsoft account
3. Verify your email
4. Add payment method (required for API usage)
   - Go to Billing > Billing overview
   - Add payment card
5. Go to https://platform.openai.com/api/keys
6. Click "Create new secret key"
7. Copy the key (it won't be shown again!)

### Option B: Existing Account
1. Go to https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Copy the key

## Step 2: Add API Key to Environment

### In cake-shop folder, create or update `.env.local`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk_your_actual_key_here

# Image Generation Settings (Optional)
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=standard
```

### Keep this file PRIVATE:
- Add to `.gitignore` (already should be there)
- Never commit to git
- Never share the key

## Step 3: Install OpenAI Package

In the `cake-shop` directory, run:

```bash
npm install openai
```

## Step 4: Verify Setup

Run this test to confirm API key works:

```bash
npm run dev
```

Then trigger a cake preview generation. Check terminal for any errors.

## Step 5: Pricing & Cost Management

### DALL-E 3 Pricing (as of Jan 2026):
- **1024x1024**: $0.080 per image
- **1024x1792**: $0.120 per image
- **1792x1024**: $0.120 per image

### Cost Control:
1. Set usage limits in OpenAI dashboard: https://platform.openai.com/account/billing/limits
2. Monitor usage: https://platform.openai.com/account/billing/overview
3. Set up email alerts for high usage

### Example Costs:
- 100 cake previews: ~$8
- 1000 cake previews: ~$80
- 10,000 cake previews: ~$800

## Troubleshooting

### Error: "API key not found"
- Check `.env.local` file exists in cake-shop folder
- Verify key starts with `sk_`
- Restart dev server after adding key

### Error: "Insufficient quota"
- Add payment method to OpenAI account
- Check usage limits aren't exceeded

### Error: "Rate limit exceeded"
- Wait a moment before retrying
- Contact OpenAI support if persistent

## Security Notes

✅ DO:
- Store key in `.env.local`
- Rotate keys regularly
- Use different keys for dev/prod
- Monitor API usage

❌ DON'T:
- Commit keys to git
- Share keys in public
- Put keys in frontend code
- Use same key everywhere

## Testing the Integration

After setup, test by:
1. Navigate to cake details page
2. Click "Generate AI Preview"
3. Watch for successful image generation
4. Check for errors in console

---

**Questions?** Check OpenAI docs: https://platform.openai.com/docs
