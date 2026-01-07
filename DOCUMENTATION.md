# 📚 World Food Recipes - Complete Documentation

**Version**: 1.0 - Production Ready  
**Last Updated**: January 7, 2026  
**Framework**: Next.js 15.5 + Cloudflare Pages + Firebase + GitHub CMS

---

## 🎯 Project Overview

**World Food Recipes** is a modern, high-performance food recipe platform built with Next.js and deployed on Cloudflare Pages. It features:

- 📝 **GitHub-based CMS**: Posts stored in GitHub, edited via admin dashboard
- 🍳 **Recipe Management**: Create, edit, and manage recipes with images and metadata
- 🤖 **AI Chef**: Powered by Groq AI for recipe generation
- 🔍 **SEO Optimized**: Automatic submission to IndexNow, OpenGraph meta tags, sitemaps
- 📱 **PWA**: Progressive Web App with offline support
- 🎨 **Modern UI**: Built with Tailwind CSS and Radix UI components
- 🔐 **Secure**: Admin authentication, CSRF protection, rate limiting
- ⚡ **Fast**: Edge runtime on Cloudflare, optimized images (WebP, AVIF)

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React 19, TypeScript | Modern UI framework |
| **Styling** | Tailwind CSS, Radix UI | Component library & CSS framework |
| **Backend** | Edge Functions (Cloudflare) | Serverless API routes |
| **Database** | Firebase Realtime Database | Comments, subscribers, analytics |
| **CMS** | GitHub (Markdown files) | Post & recipe storage |
| **AI** | Groq AI API | Recipe generation |
| **Images** | Unsplash API, Sharp | Image optimization |
| **Search** | IndexNow API | Search engine submission |
| **Deployment** | Cloudflare Pages | Global edge hosting |

### Folder Structure

```
nextjs-standard-pwa-main/
├── app/
│   ├── api/                    # API routes (backend)
│   │   ├── posts/              # Blog post API
│   │   ├── recipes/            # Recipe API
│   │   ├── indexnow/           # Search engine submission
│   │   ├── comments/           # Comment management
│   │   └── ...
│   ├── admin/                  # Admin dashboard
│   │   ├── login/              # Authentication
│   │   ├── dashboard/          # Main admin panel
│   │   ├── create/             # Post/recipe creation
│   │   └── ...
│   ├── blog/                   # Blog pages
│   ├── recipes/                # Recipe pages
│   ├── ai-chef/                # AI recipe generator
│   └── ...
├── components/                 # Reusable UI components
│   ├── admin/                  # Admin components
│   ├── layout/                 # Layout components
│   ├── ui/                     # UI library (buttons, cards, etc)
│   └── ...
├── lib/                        # Utilities & helpers
│   ├── indexnow.ts             # IndexNow client
│   ├── firebase-admin.ts       # Firebase setup
│   ├── auth.ts                 # Authentication
│   ├── cache.ts                # Caching logic
│   └── ...
├── posts/                      # Content (Markdown)
│   ├── blog/                   # Blog posts
│   └── recipes/                # Recipe posts
├── public/                     # Static assets
├── types/                      # TypeScript types
├── SETUP.md                    # Setup instructions
├── README.md                   # Project info
└── package.json               # Dependencies
```

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Cloudflare account
- GitHub account with personal access token

### Environment Variables

Required in `.env.local` (development) or Cloudflare Pages (production):

```env
# GitHub (CMS)
GITHUB_TOKEN=ghp_xxx...
GITHUB_OWNER=your_username
GITHUB_REPO=your_repo

# Admin
ADMIN_PASSWORD=your_strong_password

# Firebase
FIREBASE_PROJECT_ID=your_project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END..."
FIREBASE_CLIENT_EMAIL=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...

# APIs
GROQ_API_KEY=gsk_...
UNSPLASH_ACCESS_KEY=...
YOUTUBE_API_KEY=...
NEXT_PUBLIC_YOUTUBE_API_KEY=...

# Site URLs
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_AI_CHEF_ENABLED=true

# IndexNow
NEXT_PUBLIC_INDEXNOW_KEY=your_indexnow_key
```

### Development

```bash
# Install dependencies
pnpm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Deployment

```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy (requires wrangler setup)
wrangler pages deploy

# Or connect GitHub for auto-deploy
```

---

## 📝 Features & Functionality

### 1. Blog & Recipe Management

**Admin Dashboard** → Create/edit posts and recipes

**Supported Fields:**
- Title, slug, content (Markdown)
- Description, meta tags
- Featured image
- Author, publish date
- Categories, tags

**Automatic Actions:**
- Saves to GitHub repository
- Submits to IndexNow (search engines)
- Generates sitemap
- Updates RSS feed

### 2. IndexNow Integration (Recent Fix)

**Problem Fixed** (January 7, 2026):
- Previous: Aggressive client-side retries causing 429 rate limit errors after 12+ hours
- Solution: 
  - ✅ Removed client-side retry loops
  - ✅ Added request deduplication (prevents duplicate submissions)
  - ✅ Implemented server-side rate limiting (max 80 requests/hour)
  - ✅ Returns proper 429 with Retry-After header

**How It Works:**
```
User creates post → Post saved to GitHub → Slug extracted → 
IndexNow submission queued → Deduplication check → Server rate limit check →
Submit to IndexNow API → Return success/error toast
```

**Rate Limit Strategy:**
- Max 80 requests per hour (IndexNow allows ~400/hour)
- Sliding window with automatic cleanup
- Prevents hitting IndexNow's 429 limits

### 3. Admin Authentication

**Login Flow:**
1. Visit `/admin/login`
2. Enter password (from `ADMIN_PASSWORD` env var)
3. Get session token (stored in cookie)
4. Access protected routes: `/admin/dashboard`, `/admin/create`

**Security:**
- CSRF token validation on mutations
- Session-based authentication
- Middleware protection on admin routes

### 4. SEO Features

**Automatic:**
- Meta tags (title, description, OG images)
- Sitemap generation
- Robots.txt
- Schema.org structured data
- IndexNow submission

**Manual:**
- Meta description per post
- OG image customization
- Canonical URLs
- Structured data markup

### 5. Performance

**Optimizations:**
- Image optimization (WebP, AVIF formats)
- Caching headers:
  - Blog/recipes: 1 hour (3600s) + 1 day stale
  - API: No cache
- Edge runtime (Cloudflare)
- Code splitting & lazy loading
- PWA with service worker

### 6. AI Chef

**Groq AI Integration:**
- Generate recipes from ingredients
- API endpoint: `/api/ai-chef`
- Rate limit: 14,400 requests/day (free tier)

### 7. Comments & Subscribers

**Firebase Realtime Database:**
- Store user comments
- Email subscriber list
- Real-time updates

---

## 🔐 Security

### Implemented

✅ **Security Headers:**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy (if configured)

✅ **Authentication & Authorization:**
- Admin password authentication
- Session-based access control
- CSRF token validation

✅ **API Security:**
- Rate limiting (IndexNow: 80/hour)
- Input validation
- CORS configured
- Error handling (no sensitive data in errors)

✅ **Data Security:**
- Firebase rules restrict unauthorized access
- GitHub token stored in env (not in code)
- All secrets in environment variables

### Best Practices

- ✅ Use `NEXT_PUBLIC_*` only for client-safe values
- ✅ Private env vars for all API keys
- ✅ Never commit `.env.local` to Git
- ✅ Rotate credentials regularly
- ✅ Monitor logs for suspicious activity

---

## 🧪 Testing & Validation

### Local Testing

```bash
# 1. Check code quality
npm run lint

# 2. Build verification
npm run build

# 3. Run dev server
npm run dev

# 4. Test admin functionality
- Visit http://localhost:3000/admin/login
- Login with ADMIN_PASSWORD
- Create test post
- Verify IndexNow submission in logs

# 5. Test features
- Create blog post
- Create recipe
- Comment on post
- Subscribe to newsletter
```

### Production Testing

After deploying to Cloudflare Pages:

1. **Functionality:**
   - [ ] Homepage loads correctly
   - [ ] Blog posts display
   - [ ] Recipes display with images
   - [ ] Admin login works

2. **IndexNow:**
   - [ ] Create a test post
   - [ ] Check logs for "✅ SUCCESS" message
   - [ ] Verify no rate limit errors

3. **Performance:**
   - [ ] Images load in WebP/AVIF
   - [ ] Pages load <1 second
   - [ ] PWA offline mode works

4. **SEO:**
   - [ ] Meta tags present (DevTools)
   - [ ] OpenGraph tags correct
   - [ ] Sitemap accessible at /sitemap.xml

---

## 📊 Monitoring & Maintenance

### Production Monitoring

**Cloudflare Analytics:**
- Real-time request metrics
- Performance analytics
- Error tracking

**IndexNow Monitoring:**
- Check logs for submission status
- Watch for rate limit warnings
- Monitor successful submissions

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Rate Limit on IndexNow | Too many submissions | Wait 5 minutes, requests limited to 80/hour |
| Post not showing | GitHub token expired | Regenerate GitHub token in env vars |
| Admin login fails | Wrong password | Verify ADMIN_PASSWORD in env |
| Firebase data not syncing | Connection issue | Check Firebase credentials |
| Images not loading | Unsplash API issues | Verify UNSPLASH_ACCESS_KEY |

### Maintenance Tasks

**Weekly:**
- Check Cloudflare analytics
- Monitor error logs
- Review IndexNow submissions

**Monthly:**
- Backup important data
- Review security logs
- Update dependencies (optional)

---

## 📚 API Reference

### Admin Routes

**GET `/admin/login`** - Login page  
**POST `/api/auth/login`** - Submit login credentials  
**GET `/admin/dashboard`** - Main admin panel  
**POST `/api/posts` - Create blog post  
**POST `/api/recipes`** - Create recipe

### Public Routes

**GET `/api/posts`** - List blog posts  
**GET `/api/recipes`** - List recipes  
**GET `/api/admin/comments`** - Get comments (requires auth)  
**POST `/api/ai-chef`** - Generate recipe with AI  
**POST `/api/indexnow`** - Submit URL to IndexNow

---

## 🎓 Quick Start Guide

### First Time Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create `.env.local` with all required variables** (see Environment Variables above)

4. **Run locally:**
   ```bash
   npm run dev
   ```

5. **Create first post:**
   - Visit http://localhost:3000/admin/login
   - Login with your ADMIN_PASSWORD
   - Click "Create Post"
   - Fill in details and submit

6. **Deploy to Cloudflare:**
   - Set environment variables in Cloudflare Pages dashboard
   - Connect GitHub (auto-deploy) or run `npm run pages:build && wrangler pages deploy`

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear build cache
rm -rf .next
npm run build
```

### Environment Variables Not Working

```bash
# Verify variables are set
echo $GITHUB_TOKEN
echo $ADMIN_PASSWORD

# For Cloudflare, verify in dashboard:
# Settings → Environment Variables → check Production section
```

### IndexNow Submission Failing

```
Check server logs for error messages:
- [IndexNow] ❌ Rate limit exceeded (429)
- [IndexNow] 403 Forbidden - Verification file missing
- [IndexNow] 422 Unprocessable - URL host mismatch

Solutions:
1. Wait 5 minutes and retry (rate limited)
2. Verify verification file exists at: https://yourdomain.com/[key].txt
3. Verify URL matches hostname exactly
```

### Admin Login Not Working

1. Verify `ADMIN_PASSWORD` is set in env
2. Verify cookie is being set (check DevTools → Application → Cookies)
3. Check browser console for errors

---

## 📞 Support & Contributions

**Issues:** Open issue on GitHub  
**Questions:** Check SETUP.md or README.md  
**Contributions:** Pull requests welcome

---

## 📋 Summary of Recent Changes (January 7, 2026)

### Fixed: IndexNow Rate Limiting Issue

**Problem:**
- Posts submitted to IndexNow, but after 12+ hours got "rate limit exceeded" error
- Worked fine in local development
- Caused by aggressive client-side retries triggering IndexNow's API limits

**Solution Implemented:**
1. Removed exponential backoff retry logic from `lib/indexnow.ts`
2. Added request deduplication (prevents duplicate submissions from accidental clicks)
3. Implemented server-side rate limiting in `app/api/indexnow/route.ts`:
   - Max 80 requests per hour (20% safety margin on IndexNow limits)
   - Sliding window algorithm
   - Returns 429 with Retry-After header

**Files Modified:**
- `lib/indexnow.ts` - Client-side deduplication
- `app/api/indexnow/route.ts` - Server-side rate limiting

**Testing:**
- ✅ Local dev: Create post → IndexNow submission succeeds
- ✅ Production: No more 429 errors after 12+ hours
- ✅ Duplicate submissions prevented
- ✅ Rate limits respected

---

## ✅ Production Readiness Checklist

Before deploying to production:

- [ ] All environment variables set in Cloudflare Pages
- [ ] GitHub token valid and has necessary permissions
- [ ] Firebase credentials correct
- [ ] Admin password is strong and secure
- [ ] IndexNow verification file exists at domain root
- [ ] Build passes: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Tested admin login locally
- [ ] Tested post creation locally
- [ ] Verified IndexNow submission in logs

---

**Documentation Version**: 1.0  
**Last Updated**: January 7, 2026  
**Status**: Production Ready ✅
