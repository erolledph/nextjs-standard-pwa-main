# 🎯 QUICK ACTION ITEMS - 30-DAY OPTIMIZATION PLAN

## Priority 1: SEO Quick Wins (Week 1)
**Time**: 2-3 hours | **Impact**: +20% organic traffic

### Task 1.1: Add Image Alt Text ✅
```tsx
// components/pages/blog/BlogPostCard.tsx
- Image alt={`${post.title} - World Food Recipes`}
- BlogPostCardSkeleton.tsx
- components/pages/recipes/RecipePostCard.tsx
- RecipePostCardSkeleton.tsx

CHECKLIST:
- [ ] Update BlogPostCard
- [ ] Update RecipePostCard  
- [ ] Test in browser DevTools
- [ ] Verify in Google Search Console
```

**Command to find all images**:
```bash
grep -r "<Image" components/ --include="*.tsx" | grep -v "alt=" | head -20
```

### Task 1.2: Add FAQ Schema ✅
**File**: `app/faq/page.tsx`

```tsx
// ADD to faqPage.tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
}

// Add script tag:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

**Expected Result**: FAQ rich snippets in Google Search results.

---

## Priority 2: Security & Auth Fixes (Week 1-2)
**Time**: 1-2 hours | **Impact**: Prevents session hijacking

### Task 2.1: Add Session Expiration
**File**: `lib/auth.ts`

```typescript
const SESSION_EXPIRY = 24 * 60 * 60 * 1000  // 24 hours

export async function setAdminSession() {
  const cookies = await cookies()
  const token = generateSecureToken()
  
  cookies.set(SESSION_TOKEN, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: SESSION_EXPIRY,  // ← ADD THIS
    path: '/'
  })
  
  // Store creation time
  cookies.set('session-created', Date.now().toString(), {
    httpOnly: false,
    maxAge: SESSION_EXPIRY
  })
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookies = await cookies()
  const sessionToken = cookies.get(SESSION_TOKEN)?.value
  const createdAt = parseInt(cookies.get('session-created')?.value || '0')
  
  if (!sessionToken) return false
  
  // Check expiration
  const now = Date.now()
  if (now - createdAt > SESSION_EXPIRY) {
    cookies.delete(SESSION_TOKEN)
    return false
  }
  
  return true
}
```

### Task 2.2: Add HSTS Header
**File**: `next.config.mjs`

```javascript
// In headers() function:
{
  source: '/:path*',
  headers: [
    // ... existing headers
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload'
    }
  ]
}
```

---

## Priority 3: Revenue Setup (Week 2)
**Time**: 1 hour | **Impact**: $50-100/month

### Task 3.1: Setup Google AdSense ✅
1. Go to: https://www.google.com/adsense/start/
2. Follow signup (approval takes 2-4 weeks)
3. Add ad units to `app/layout.tsx`

```tsx
// In app/layout.tsx
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  crossOrigin="anonymous"
/>

// In app/blog/[slug]/page.tsx - Add ad below heading:
<ins 
  className="adsbygoogle"
  style={{ display: 'block', textAlign: 'center' }}
  data-ad-layout="in-article"
  data-ad-format="fluid"
  data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
  data-ad-slot="xxxxxxxxxxxxxxxx"
/>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({})
</script>
```

### Task 3.2: Setup Amazon Affiliates ✅
1. Sign up: https://affiliate-program.amazon.com/
2. Create mapping: `lib/affiliate-links.ts`

```typescript
export const AFFILIATE_LINKS = {
  'salt': 'https://amazon.com/s?k=sea-salt&tag=YOUR_CODE',
  'olive oil': 'https://amazon.com/s?k=olive-oil&tag=YOUR_CODE',
  // ... more ingredients
}

export function getAffiliateLink(ingredient: string): string {
  return AFFILIATE_LINKS[ingredient.toLowerCase()] || 
    `https://amazon.com/s?k=${ingredient}&tag=YOUR_CODE`
}
```

---

## Priority 4: Logging & Monitoring (Week 3)
**Time**: 1-2 hours | **Impact**: Production debugging

### Task 4.1: Setup Sentry (Free Tier)
```bash
npm install @sentry/nextjs

# Add to lib/logger-service.ts:
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Usage:
catch (error) {
  Sentry.captureException(error, {
    contexts: { custom: { endpoint, statusCode } }
  });
}
```

### Task 4.2: Add Error Recovery
**File**: `lib/fetch-with-retry.ts`

```typescript
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok || attempt === maxRetries) return response
      
      if (response.status >= 500) {
        await new Promise(r => 
          setTimeout(r, Math.pow(2, attempt) * 1000)
        )
        continue
      }
      return response
    } catch (error) {
      if (attempt === maxRetries) throw error
      await new Promise(r => 
        setTimeout(r, Math.pow(2, attempt) * 1000)
      )
    }
  }
  throw new Error("Max retries exceeded")
}
```

---

## Priority 5: Email Newsletter (Week 3-4)
**Time**: 1 hour setup | **Impact**: Build recurring audience

### Task 5.1: Add Newsletter Form
```tsx
// components/NewsletterSubscribe.tsx
export function NewsletterSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    // Send to Substack API
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
    
    setStatus(response.ok ? 'success' : 'error')
    if (response.ok) setEmail('')
  }
  
  return (
    <form onSubmit={handleSubmit} className="newsletter-form">
      <input 
        type="email" 
        placeholder="Enter your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status === 'success' && <p>✅ Check your email!</p>}
    </form>
  )
}
```

### Task 5.2: Add to Footer
```tsx
// components/layout/Footer.tsx
import { NewsletterSubscribe } from '@/components/NewsletterSubscribe'

export function Footer() {
  return (
    <footer>
      {/* ... existing footer content ... */}
      
      <div className="newsletter-section">
        <h3>Weekly Recipe Newsletter</h3>
        <p>Get new recipes delivered every week</p>
        <NewsletterSubscribe />
      </div>
    </footer>
  )
}
```

---

## Implementation Checklist

### Week 1
- [ ] Add image alt text to all components
- [ ] Add FAQ schema to faq/page.tsx
- [ ] Add session expiration to auth
- [ ] Add HSTS header to next.config.mjs
- [ ] Test changes: `pnpm build && pnpm dev`

### Week 2  
- [ ] Signup for Google AdSense
- [ ] Signup for Amazon Associates
- [ ] Add affiliate links mapping
- [ ] Create `lib/fetch-with-retry.ts`

### Week 3-4
- [ ] Setup Sentry account
- [ ] Implement error recovery
- [ ] Create newsletter form
- [ ] Add to footer

### Testing Checklist
```bash
# Before deployment:

# 1. Build succeeds
pnpm build

# 2. No TypeScript errors
pnpm tsc --noEmit

# 3. All SEO checks
npm run seo-check  # If you add a script

# 4. Visual regression testing
# - Check recipe page
# - Check blog page
# - Check admin dashboard
# - Check footer

# 5. Performance check
# pnpm build -> analyze bundle size

# 6. Security check
# - Test admin session expiry
# - Verify HSTS header
# - Check rate limiting

# 7. Deploy and verify
pnpm build && pnpm deploy
```

---

## Tracking Progress

Print this weekly to track completion:

```
Week 1 Progress: [ ] [ ] [ ] [ ] (0-4 tasks)
Week 2 Progress: [ ] [ ] [ ] [ ] (0-4 tasks)  
Week 3 Progress: [ ] [ ] [ ] [ ] (0-4 tasks)
Week 4 Progress: [ ] [ ] (0-2 tasks)

Monthly Revenue: $XXX
Monthly Organic Traffic: XXX visits
```

---

## Support Resources

- SEO: Use Google Search Console beta insights
- Affiliate: Monitor Amazon Associates dashboard  
- Ads: Check Google AdSense earnings weekly
- Analytics: Setup Google Analytics 4 (free)
- Monitoring: Sentry.io error tracking
- Email: Substack stats dashboard
