# 🚀 Setup & Configuration Guide

Complete setup instructions for **World Food Recipes** PWA with AI Chef integration.

---

## 📋 Prerequisites

### Required
- **Node.js** v20.0 or higher ([Download](https://nodejs.org))
- **pnpm** v9.0+ ([Install](https://pnpm.io/installation))
  ```bash
  npm install -g pnpm
  ```
- **Git** for version control

### Required API Keys
1. **Groq API Key** (for AI recipe generation)
   - Free tier: 14,400 requests/day
   - Sign up at [groq.com](https://console.groq.com)

2. **GitHub Personal Access Token** (for CMS)
   - Create at [github.com/settings/tokens](https://github.com/settings/tokens)
   - Scopes: `repo` (full repository access)

### Optional
- **Firebase Project** (for comments & subscribers)
- **Google Analytics ID** (for tracking)
- **YouTube API Key** (for video integration)

---

## 🔧 Environment Variables

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Fill in required variables

```env
# ========== REQUIRED ==========

# Groq API - AI Recipe Generation
GROQ_API_KEY=gsk_your_groq_key_here

# GitHub CMS Integration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_repository_name
GITHUB_BRANCH=main

# ========== OPTIONAL ==========

# Admin Configuration
ADMIN_PASSWORD=changeme  # MUST change before production!

# Analytics
NEXT_PUBLIC_GA_ID=G_your_google_analytics_id

# Firebase (for comments/subscribers)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (backend)
FIREBASE_ADMIN_SDK_KEY=your_firebase_admin_key_json

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# Debugging
NEXT_PUBLIC_DEBUG=false  # Set to true for verbose logging

# ========== SITE CONFIG ==========
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=World Food Recipes
NEXT_PUBLIC_SITE_DESCRIPTION=Share and discover world recipes
```

---

## 🔑 Getting API Keys

### 1. Groq API Key

**Free tier includes:** 14,400 requests per day + 30 requests per minute

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or login
3. Navigate to **API Keys**
4. Click **Create New API Key**
5. Copy the key and add to `.env.local`
6. Test with:
   ```bash
   curl -X POST "https://api.groq.com/openai/v1/chat/completions" \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.1-8b-instant","messages":[{"role":"user","content":"Hi"}]}'
   ```

### 2. GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes:
   - `repo` - Full repository access
   - `read:user` - Read user profile
4. Copy token and add to `.env.local`

### 3. Firebase Project (Optional)

**For comments & subscriber management:**

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **Go to console**
3. Create new project
4. Enable **Firestore Database**
5. Download service account key:
   - Project settings → Service Accounts
   - Generate new private key (JSON)
6. Add `FIREBASE_ADMIN_SDK_KEY` to `.env.local`
7. Configure Firestore security rules:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /comments/{document=**} {
         allow read: if true;
         allow write: if request.auth.uid != null;
       }
       match /subscribers/{document=**} {
         allow read: if false;
         allow write: if true;
       }
     }
   }
   ```

### 4. Google Analytics (Optional)

1. Go to [analytics.google.com](https://analytics.google.com)
2. Create new property
3. Copy **Measurement ID** (starts with `G_`)
4. Add to `.env.local` as `NEXT_PUBLIC_GA_ID`

### 5. YouTube API Key (Optional)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable **YouTube Data API v3**
4. Create API Key credentials
5. Add to `.env.local` as `YOUTUBE_API_KEY`

---

## 💾 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/erolledph/nextjs-standard-pwa-main.git
cd nextjs-standard-pwa-main
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This installs all dependencies defined in `package.json`:
- Next.js 15.5.2
- React 19
- TypeScript 5
- Tailwind CSS
- Firebase SDK
- And 20+ others

### Step 3: Verify Installation

```bash
pnpm type-check  # Verify TypeScript
pnpm lint        # Check code quality
```

---

## 🏃 Development

### Start Development Server

```bash
pnpm dev
```

Server will start at [http://localhost:3000](http://localhost:3000)

**Features:**
- Hot Module Replacement (HMR)
- Fast refresh on file changes
- Debug mode enabled
- Source maps for error tracking

### View Application

- **Home:** [http://localhost:3000](http://localhost:3000)
- **Recipes:** [http://localhost:3000/recipes](http://localhost:3000/recipes)
- **Blog:** [http://localhost:3000/blog](http://localhost:3000/blog)
- **AI Chef:** [http://localhost:3000/ai-chef](http://localhost:3000/ai-chef)
- **Admin Dashboard:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

### Admin Login

Default credentials:
- **Username:** `admin`
- **Password:** `changeme`

⚠️ **Change password immediately after first login!**

---

## 🔐 Admin Credentials Management

### Change Admin Password

Edit `middleware.ts`:

```typescript
// Find this section and update:
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
// Change to your secure password
```

Or set environment variable:

```env
ADMIN_PASSWORD=your_secure_password_here
```

### Production Security

Before deploying:
1. ✅ Change admin password
2. ✅ Rotate API keys if exposed
3. ✅ Enable HTTPS only
4. ✅ Set secure cookie flags
5. ✅ Update CORS settings
6. ✅ Review Firebase security rules
7. ✅ Enable rate limiting

---

## 🗄️ Database Setup (Optional)

### Firebase Firestore

Used for comments and subscriber management.

#### Collections Required

1. **comments**
   ```
   {
     id: string (auto)
     slug: string
     author: string
     email: string
     content: string
     approved: boolean
     createdAt: timestamp
     repliedAt: timestamp (optional)
   }
   ```

2. **subscribers**
   ```
   {
     id: string (auto)
     email: string
     subscribedAt: timestamp
     unsubscribeToken: string
   }
   ```

#### Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /comments/{document=**} {
      allow read: if true;
      allow create: if request.resource.data.email != '';
      allow update: if request.auth.uid != null;
      allow delete: if request.auth.uid != null;
    }
    
    match /subscribers/{document=**} {
      allow read: if false;
      allow create: if request.resource.data.email != '';
      allow delete: if true;
    }
  }
}
```

---

## 🏗️ Build for Production

### Create Production Build

```bash
pnpm build
```

This creates:
- Optimized production bundle in `.next/`
- ~101KB shared JavaScript
- Minified assets
- Static page prerender

### Start Production Server

```bash
pnpm start
```

Server runs on port 3000 by default.

### Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data (23/23)
✓ Generating static pages
✓ Finalizing page optimization

Routes:
- 15 static (○) - prerendered
- 25 dynamic (ƒ) - server-rendered
```

---

## 🌐 Deployment

### Option 1: Cloudflare Pages (Recommended)

**Why:** Edge runtime, zero cold starts, global distribution

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect in Cloudflare**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create Project → Connect Git
   - Select repository

3. **Configure Build**
   - Framework: `Next.js`
   - Build command: `pnpm build`
   - Output directory: `.next`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Deploy**
   - Save and deploy
   - Site available at `project-name.pages.dev`

### Option 2: Vercel (Alternative)

1. Go to [vercel.com](https://vercel.com)
2. Import repository
3. Auto-detected Next.js
4. Add environment variables
5. Deploy

### Option 3: Self-Hosted with Docker

**Create Dockerfile:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Start
EXPOSE 3000
CMD ["pnpm", "start"]
```

**Build and run:**

```bash
docker build -t world-food-recipes .
docker run -p 3000:3000 -e GROQ_API_KEY=xxx world-food-recipes
```

---

## 📊 Monitoring & Maintenance

### Quota Monitoring

Check AI recipe quota in admin dashboard:
- Navigate to `/admin/dashboard`
- Click "Groq Quota" tab
- View daily request/token usage
- See per-minute rate limits

### Analytics

Monitor performance:
- Lighthouse scores: `/api/analytics`
- Web Vitals: Console output
- Google Analytics: Analytics dashboard

### Logs

Enable detailed logging:

```env
NEXT_PUBLIC_DEBUG=true
```

Logs prefixes:
- `[GROQ-*]` - AI recipe generation
- `[QUOTA-*]` - Quota tracking
- `[CACHE-*]` - Cache operations
- `[AUTH-*]` - Authentication events

---

## 🔄 Updating

### Update Dependencies

```bash
pnpm update
pnpm build
pnpm type-check
```

### Update Next.js

```bash
pnpm add next@latest
pnpm build
```

---

## 🆘 Troubleshooting

### AI Recipe Generation Not Working

**Issue:** "Daily Recipe Limit Reached" or "Connection Error"

**Solutions:**
1. Check `GROQ_API_KEY` in `.env.local`
2. Verify key has quota remaining at [console.groq.com](https://console.groq.com)
3. Check quota dashboard at `/admin/dashboard` → Groq Quota tab
4. Look for `[GROQ-*]` logs in terminal

### Admin Login Not Working

**Issue:** 401 or redirect loop

**Solutions:**
1. Clear cookies: `DevTools → Application → Cookies → Delete`
2. Verify `ADMIN_PASSWORD` matches middleware
3. Check session cookie exists: `DevTools → Application → Cookies`
4. Ensure `.env.local` is loaded: restart dev server

### Build Fails

**Issue:** TypeScript or ESLint errors

**Solutions:**
```bash
# Clear cache
rm -rf .next node_modules
pnpm install

# Check types
pnpm type-check

# Check lint
pnpm lint

# Full rebuild
pnpm build
```

### Slow Performance

**Issue:** Pages load slowly or AI responses are slow

**Solutions:**
1. Check cache stats: `/api/cache-stats`
2. Verify ISR revalidation: check logs for revalidate messages
3. Monitor Groq response times: check `[GROQ-*]` logs
4. Profile with DevTools Lighthouse

### Firebase Connection Error

**Issue:** Comments or subscribers not working

**Solutions:**
1. Verify `FIREBASE_ADMIN_SDK_KEY` in `.env.local`
2. Check Firestore rules: [firebase.google.com/console](https://firebase.google.com/console)
3. Ensure collections exist: `comments` and `subscribers`
4. Check security rules allow write access

---

## 📚 Additional Resources

- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Groq API Docs:** [console.groq.com/docs](https://console.groq.com/docs)
- **Firebase Docs:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **Tailwind CSS:** [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **React 19:** [react.dev](https://react.dev)

---

## 🎯 Verification Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Admin password changed
- [ ] Groq API key working (check quota)
- [ ] GitHub token valid
- [ ] Firebase project setup (if using)
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Analytics integrated
- [ ] Backup strategy in place
- [ ] Error monitoring active
- [ ] Database backups automated

---

## 💡 Tips & Best Practices

### Performance
- Use ISR revalidation for frequent updates
- Enable image optimization in `next.config.mjs`
- Monitor Core Web Vitals regularly
- Keep cache TTL reasonable (default: 1 hour)

### Security
- Never commit `.env.local` to git
- Rotate API keys periodically
- Use HTTPS only in production
- Enable CSP headers
- Keep dependencies updated

### Maintenance
- Set up automated dependency updates (Dependabot)
- Monitor error logs daily
- Review analytics weekly
- Test disaster recovery monthly

---

## 🆘 Support

Need help? Check:
1. [README.md](./README.md) - Project overview
2. GitHub Issues - Known problems
3. Logs - Check [GROQ-*], [QUOTA-*] prefixes
4. Console - Browser DevTools errors

---

**Happy cooking! 🍳**
