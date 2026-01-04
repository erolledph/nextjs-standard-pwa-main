# Environment Variables Setup for Search Engine Submission

## Issue: Bing API Not Working

Your Bing Webmaster submissions are failing because the `BING_WEBMASTER_API_KEY` environment variable is not set in Cloudflare Pages.

---

## How to Set Environment Variables in Cloudflare Pages

### Step 1: Go to Cloudflare Dashboard
1. Visit [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** in the left sidebar
4. Click on your project: **nextjs-standard-pwa-main**

### Step 2: Access Environment Variables
1. Click on your Pages project
2. Go to **Settings** tab
3. Scroll down to **Environment Variables** section
4. Click **Edit Variables**

### Step 3: Add Required Variables

Add these environment variables (check which you need):

#### Required for IndexNow:
```
NEXT_PUBLIC_INDEXNOW_KEY=37ced97b3f05467fa60919e05ed8b79c
NEXT_PUBLIC_SITE_URL=https://worldfoodrecipes.sbs
```

#### Required for Bing Webmaster:
```
BING_WEBMASTER_API_KEY=your_bing_api_key_here
```

#### Required for GitHub (if posts aren't loading):
```
GITHUB_OWNER=erolledph
GITHUB_REPO=nextjs-standard-pwa-main
GITHUB_TOKEN=ghp_your_github_token_here
```

---

## How to Get Your Bing Webmaster API Key

### Step 1: Go to Bing Webmaster Tools
1. Visit [https://www.bing.com/webmasters](https://www.bing.com/webmasters)
2. Sign in with your Microsoft/Outlook account
3. Select your site (worldfoodrecipes.sbs)

### Step 2: Find API Key
1. Go to **Settings** → **API access**
2. Copy your **API Key**
3. Note your **Site ID** (for reference)

### Step 3: Add to Cloudflare
1. In Cloudflare Pages > Environment Variables
2. Add new variable:
   - **Name:** `BING_WEBMASTER_API_KEY`
   - **Value:** `[Paste your API key here]`
3. Click **Save and Deploy**

---

## Environment Variable Summary

| Variable | Purpose | Where to Get | Status |
|----------|---------|--------------|--------|
| `NEXT_PUBLIC_SITE_URL` | Your domain | You own it | ✅ Set |
| `NEXT_PUBLIC_INDEXNOW_KEY` | IndexNow API key | Bing Webmaster Tools | ✅ Set |
| `BING_WEBMASTER_API_KEY` | Bing submission API | Bing Webmaster Tools | ❌ **Missing** |
| `GITHUB_OWNER` | Your GitHub username | Your GitHub profile | ✅ Set |
| `GITHUB_REPO` | Repo name | Your GitHub repo | ✅ Set |
| `GITHUB_TOKEN` | GitHub access token | GitHub Settings > Developer settings | ✅ Set |

---

## After Adding Variables

1. **Save and Deploy** in Cloudflare
2. **Wait 2-3 minutes** for deployment to complete
3. **Create a test blog post** in admin panel
4. **Check browser console** for submission results:
   - ✅ Should see: `[Bing Submission Success]`
   - ✅ Should see: `[IndexNow Submission Success]` or rate limited message

---

## What Happens After Fix

When you create a blog post:

```
1. Admin fills form & clicks "Publish"
   ↓
2. Post saved to GitHub (/posts/blog/your-post.md)
   ↓
3. Auto-submit to search engines:
   ├─ IndexNow → URLs indexed in 1-2 hours
   └─ Bing Webmaster → URLs indexed in 1-7 days
   ↓
4. Success! Content visible in:
   - Google search
   - Bing search
   - Yahoo search
   - Your blog at /blog
```

---

## Troubleshooting

### If Bing Still Returns 500:
1. Check API key is correct
2. Check key has "Webmaster" permission in Bing
3. Verify site is verified in Bing Webmaster Tools

### If IndexNow Returns 429:
- This is rate limiting - it's normal!
- Your URLs will still be indexed
- Just wait before submitting again

### If Submissions Don't Show in Console:
1. Make sure you're checking **browser console** (F12 → Console tab)
2. Look for `[Search Engine Submission]` messages
3. Check for network errors in **Network tab**

---

## Next Steps

1. ✅ Get Bing API key from Bing Webmaster Tools
2. ✅ Add `BING_WEBMASTER_API_KEY` to Cloudflare Pages
3. ✅ Wait 2-3 minutes for deployment
4. ✅ Create a test blog post
5. ✅ Verify submissions work in browser console

Your search engine submission system will be fully operational once the Bing API key is configured! 🚀
