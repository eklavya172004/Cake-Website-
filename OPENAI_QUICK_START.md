# Step-by-Step: Setup OpenAI for Cake Preview Generation

## 🎯 GOAL: Generate AI cake images using OpenAI DALL-E 3

---

## STEP 1: CREATE OPENAI ACCOUNT & GET API KEY

### 1A. Go to OpenAI Website
- URL: https://platform.openai.com/signup
- Click "Sign up" (or "Log in" if you have account)

### 1B. Create Account
- Email: Use your email
- Set password
- Verify email in inbox
- ✅ Account created!

### 1C. Add Payment Method
1. Click your profile → "Billing"
2. Click "Billing overview"
3. Click "Add payment method"
4. Enter credit/debit card details
5. ✅ Payment method added!

### 1D. Get API Key
1. Go to: https://platform.openai.com/api/keys
2. Click "Create new secret key"
3. Name it: "Cake Shop"
4. Click "Create secret key"
5. **COPY THE KEY** (it won't show again!)
   - Format should be: `sk_...`
6. Save it somewhere temporary

---

## STEP 2: ADD API KEY TO YOUR PROJECT

### 2A. Create `.env.local` File
In folder: `cake-shop/`

1. Create new file named: `.env.local`
2. Add this line:
   ```
   OPENAI_API_KEY=sk_your_key_here
   ```
3. Replace `sk_your_key_here` with your actual key from Step 1D
4. Save file
5. ✅ File created!

### Example:
```
OPENAI_API_KEY=sk_aBc123DefGhI456jKl789mNo
```

**⚠️ IMPORTANT:**
- This file is already in `.gitignore`
- Never commit it to git
- Never share the key

### 2B. Verify File Location
```
cake-shop/
├── .env.local          ← Create here
├── package.json
├── src/
└── ...
```

---

## STEP 3: INSTALL OPENAI PACKAGE

### 3A. Open Terminal
1. Open VS Code terminal
2. Make sure you're in `cake-shop` folder
   ```
   # Current directory should show: cake-shop>
   ```

### 3B. Run Installation Command
```bash
npm install openai
```

Wait for it to finish (should see "added 1 package")

✅ Package installed!

---

## STEP 4: RESTART DEVELOPMENT SERVER

### 4A. Stop Current Server
- In terminal, press: `Ctrl + C`

### 4B. Start New Server
```bash
npm run dev
```

Wait for message:
```
> Local:   http://localhost:3000
```

✅ Server running!

---

## STEP 5: TEST THE INTEGRATION

### 5A. Open Cake Details Page
1. Go to: `http://localhost:3000`
2. Click on any cake product
3. Scroll down to "AI-Generated Preview" section

### 5B. Generate Image
1. Click "Generate AI Preview" button
2. Wait 10-30 seconds for image to generate
3. ✅ You should see a professional cake image!

### 5C. Test Features
- Click "Regenerate" to get different designs
- Click "Download" to save the image
- Try different cakes to see variations

---

## 🎉 SUCCESS! You're Done!

Your cake shop now generates AI cake previews using OpenAI DALL-E 3!

---

## ❓ TROUBLESHOOTING

### Problem: "OpenAI API key not configured"
**Fix:**
1. Check `.env.local` exists in `cake-shop/` folder
2. Verify key starts with `sk_`
3. Restart server (`Ctrl+C`, then `npm run dev`)

### Problem: "Invalid OpenAI API key"
**Fix:**
1. Go to: https://platform.openai.com/api/keys
2. Check key format (should start with `sk_`)
3. Create new key if needed
4. Update `.env.local` with correct key
5. Restart server

### Problem: "Insufficient quota"
**Fix:**
1. Go to: https://platform.openai.com/account/billing/overview
2. Add/update payment method
3. Wait a moment
4. Try again

### Problem: Slow Image Generation
- Normal: 10-30 seconds for first image
- Uses DALL-E 3 which takes time for quality
- Don't close tab while generating!

### Problem: Image Looks Wrong
- Click "Regenerate" to try again
- Each generation is different
- Try it a few times to get best result

---

## 💰 PRICING INFO

### Cost Per Image
- **$0.080** per cake image (standard 1024x1024)

### Monthly Costs Example
- 100 cakes: ~$8
- 500 cakes: ~$40
- 1000 cakes: ~$80

### How to Limit Costs
1. Set usage cap: https://platform.openai.com/account/billing/limits
2. Check usage: https://platform.openai.com/account/billing/overview
3. Get email alerts for high usage

---

## 📋 CHECKLIST

- [ ] OpenAI account created
- [ ] Payment method added
- [ ] API key generated
- [ ] `.env.local` file created
- [ ] API key pasted in `.env.local`
- [ ] `npm install openai` completed
- [ ] Server restarted (`npm run dev`)
- [ ] Tested on cake details page
- [ ] Image generated successfully

---

## 🚀 NEXT STEPS (OPTIONAL)

Once working, you can:
1. Save generated images to database
2. Add custom photography styles
3. Generate multiple variations
4. Add watermark with shop logo
5. Track popular cake designs

---

## 📞 NEED HELP?

1. **Check error message** in browser console (F12)
2. **Check terminal** for error details
3. **Go to**: https://platform.openai.com/docs
4. **Contact OpenAI**: support.openai.com

---

**You did it! 🎂✨**
