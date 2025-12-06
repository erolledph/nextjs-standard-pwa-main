# Customization Guide

Complete guide to customizing your blogging platform branding, content, and configuration.

## Table of Contents

1. [Branding & Identity](#branding--identity)
2. [Site Configuration](#site-configuration)
3. [SEO & Metadata](#seo--metadata)
4. [Images & Assets](#images--assets)
5. [Colors & Styling](#colors--styling)
6. [Typography](#typography)
7. [Content Pages](#content-pages)
8. [Image Storage Setup](#image-storage-setup)
9. [Admin Panel](#admin-panel)
10. [Analytics](#analytics)
11. [Social Media](#social-media)
12. [Environment Variables](#environment-variables)
13. [Security Best Practices](#security-best-practices)

---

## Branding & Identity

### Site Name & Title

Update the site name throughout the project:

**Location:** `app/layout.tsx` and various page files

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'YourName Blog - Your Tagline',
    template: '%s | YourName Blog',
  },
  description: 'Your site description here',
}
```

**Files to update:**
- `app/layout.tsx` - Main site metadata
- `app/page.tsx` - Home page metadata
- `components/layout/Header.tsx` - Header logo text
- `components/layout/Footer.tsx` - Footer branding
- `app/about/page.tsx` - About page title
- `wrangler.toml` - App name

### Tagline & Description

Change your site's tagline in metadata:

```tsx
description: 'Your custom description here - make it compelling!'
```

**Update in:**
- `app/layout.tsx` - Main description
- `app/page.tsx` - Home page description
- `app/blog/page.tsx` - Blog listing description

---

## Site Configuration

### Domain Configuration

**Location:** `.env.local` and `wrangler.toml`

Update your site URL:

```env
# .env.local
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

Also update in `wrangler.toml`:
```toml
name = "your-blog"
```

### Admin Password

**Location:** `.env.local`

Set your admin panel password:

```env
ADMIN_PASSWORD=your-secure-password-here
```

**Requirements:**
- Minimum 12 characters recommended
- Use uppercase, lowercase, numbers, symbols
- Avoid dictionary words

---

## SEO & Metadata

### Global Meta Tags

**Location:** `app/layout.tsx`

Configure global SEO settings:

```tsx
export const metadata: Metadata = {
  title: {
    default: 'Your Site - Tagline',
    template: '%s | Your Site',
  },
  description: 'Your site description for search engines',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  authors: [{ name: 'Your Name' }],
}
```

### Open Graph (Social Sharing)

Configure how your site appears when shared:

```tsx
openGraph: {
  title: 'Your Site Name',
  description: 'Your description',
  url: siteUrl,
  siteName: 'Your Site Name',
  images: [{
    url: `${siteUrl}/og-image.svg`,
    width: 1200,
    height: 630,
  }],
}
```

### Twitter Card

```tsx
twitter: {
  card: 'summary_large_image',
  title: 'Your Site Name',
  creator: '@yourhandle',
}
```

### Sitemap

The sitemap is automatically generated at `/sitemap.xml`.

### Robots.txt

Control search engine crawling via `app/robots.ts`.

---

## Images & Assets

### Favicon

**Location:** `public/favicon.svg`

Replace with your favicon. SVG format is recommended.

**Recommended specs:**
- Format: SVG, PNG, or ICO
- Size: 32x32 or larger

### Open Graph Image

**Location:** `public/og-image.svg`

Used when sharing on social media.

**Recommended specs:**
- Size: 1200x630 pixels
- Format: SVG, PNG, or JPG
- Should contain your site name/logo

### Author Avatar

**Location:** `public/avatar.jpg`

Used in author cards.

**Recommended specs:**
- Size: 200x200 pixels
- Format: JPG or PNG
- Square aspect ratio

### Apple Touch Icon

**Location:** `public/apple-touch-icon.png`

Used when adding site to home screen on iOS.

**Recommended specs:**
- Size: 180x180 pixels
- Format: PNG
- Should include your logo/branding

---

## Colors & Styling

### CSS Variables

**Location:** `app/globals.css`

Customize colors for light and dark modes:

```css
:root {
  --primary: oklch(0.45 0.15 155);        /* Brand color */
  --background: oklch(0.99 0 0);          /* Page background */
  --foreground: oklch(0.15 0.01 0);       /* Text color */
  --muted: oklch(0.97 0.005 155);         /* Muted backgrounds */
}

.dark {
  --primary: oklch(0.55 0.15 155);        /* Dark mode brand */
  --background: oklch(0.12 0.01 155);     /* Dark background */
  --foreground: oklch(0.92 0.01 155);     /* Light text */
}
```

### Finding Your Brand Color

Use [oklch.com](https://oklch.com) to find OKLCH values for your brand color.

**Example: Changing to Blue**
```css
:root {
  --primary: oklch(0.50 0.20 240);      /* Blue */
}

.dark {
  --primary: oklch(0.60 0.20 240);      /* Lighter blue for dark mode */
}
```

---

## Typography

### Font Families

**Location:** `app/layout.tsx`

Current fonts: Geist (sans) and Geist Mono (monospace)

To change fonts, import from Google Fonts:

```tsx
import { Your_Font, Your_Mono } from 'next/font/google'

const yourFont = Your_Font({
  subsets: ["latin"],
  variable: '--font-sans'
})
```

### Heading Font

**Location:** Multiple components

Headings use Georgia serif by default:

```tsx
style={{ fontFamily: 'Georgia, serif' }}
```

To change globally, create a CSS class:

```css
.heading-font {
  font-family: 'Your Font', serif;
}
```

---

## Content Pages

### Home Page

**Location:** `components/pages/home/HomePage.tsx`

Update hero section text and image:

```tsx
<h1>Your Custom Headline</h1>
<p>Your custom tagline</p>
<img src="YOUR_IMAGE_URL" alt="Hero image" />
```

### About Page

**Location:** `app/about/page.tsx`

Completely customize your about page content.

### Header Navigation

**Location:** `components/layout/Header.tsx`

Add or remove navigation links:

```tsx
<nav className="hidden md:flex items-center gap-6">
  <Link href="/blog">Blog</Link>
  <Link href="/about">About</Link>
  <Link href="/contact">Contact</Link>
</nav>
```

### Footer

**Location:** `components/layout/Footer.tsx`

Customize footer links and copyright:

```tsx
<p>© {currentYear} Your Name. All rights reserved.</p>
```

### Contact Page

**Location:** `app/contact/page.tsx`

Update contact information:

```tsx
<a href="mailto:your@email.com">your@email.com</a>
<a href="https://twitter.com/yourhandle">Twitter</a>
```

---

## Image Handling

### Using External Image URLs

Images are referenced by URL only. You can host images on any external service:

**Supported image sources:**
- CDN (Cloudflare, AWS CloudFront, etc.)
- Image hosting services (Imgur, imgbb, etc.)
- Self-hosted images on your own server
- Any publicly accessible image URL

**How to use:**
1. In the admin panel, when creating/editing a post
2. Enter the full URL of your image (e.g., `https://example.com/image.jpg`)
3. The URL will be saved in the post metadata
4. Images are referenced directly from the source

**Best practices:**
- Use HTTPS URLs only
- Recommended image size for featured images: 1200x630px
- Use optimized/compressed images for faster loading
- Consider using a CDN for better performance

---

## Admin Panel

### Admin Access

**Location:** `/admin/login`

Access at `/admin/login` with your admin password.

**Session Duration:** 24 hours

To change session length, edit `lib/auth.ts`:

```tsx
maxAge: YOUR_SECONDS, // Currently 24 * 60 * 60
```

### Admin Dashboard Features

**Overview** - Quick stats and dashboard

**Create Post** - Write new blog posts in markdown

**Edit Post** - Modify existing posts by slug

**Delete Post** - Remove posts (with confirmation)

---

## Analytics

### Google Analytics

**Location:** `app/layout.tsx`

Update your GA4 tracking ID:

```tsx
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID"></script>
<script dangerouslySetInnerHTML={{
  __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-YOUR-ID');
  `
}} />
```

### Alternative Analytics

Add your preferred analytics service:

```tsx
// Example: Plausible
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## Social Media

### Social Links

**Location:** `app/contact/page.tsx`

Add your social media profiles:

```tsx
<a href="https://twitter.com/yourhandle">Twitter</a>
<a href="https://github.com/yourusername">GitHub</a>
<a href="https://linkedin.com/in/yourname">LinkedIn</a>
```

### Twitter Handle

Update in metadata files:

```tsx
twitter: {
  creator: '@yourhandle',
}
```

**Update in:**
- `app/layout.tsx`
- `app/blog/[slug]/page.tsx`

### Social Sharing

**Location:** `components/ui/social-share.tsx`

Blog posts include social sharing buttons for:
- Twitter
- Facebook
- LinkedIn
- Copy link

---

## Environment Variables

### Required Variables

**Location:** `.env.local` (local development)

```env
# GitHub Configuration
GITHUB_OWNER=your-username
GITHUB_REPO=your-blog-repo
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Admin Authentication
ADMIN_PASSWORD=your-secure-password

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### For Production (Cloudflare Pages)

Add all environment variables in Cloudflare Pages project settings:

1. Go to Cloudflare Dashboard → Pages → Your project → Settings → Environment variables
2. Add each variable above
3. Redeploy for changes to take effect

---

## Security Best Practices

### Admin Password Security

1. **Use strong password:**
   - Minimum 12 characters
   - Mix uppercase, lowercase, numbers, symbols
   - Avoid dictionary words or patterns

2. **Keep password secure:**
   - Never commit to git
   - Only store in `.env.local` and Cloudflare Pages
   - Change regularly (every 3-6 months)

3. **Protect your accounts:**
   - Enable 2FA on GitHub
   - Enable 2FA on Cloudflare
   - Keep browser and OS updated

### Secrets Management

- Never hardcode secrets in code
- Use environment variables for all secrets
- Use Cloudflare Pages Secrets for production
- Rotate secrets periodically
- Monitor access logs

### Data Privacy

- Update privacy policy to reflect your practices
- Clarify what analytics you use
- Explain image storage practices
- Document data retention policies
- Comply with GDPR if serving EU users

### Version Control

Never commit these files:
- `.env.local`
- `.env*.local`
- Any file containing passwords or keys

Ensure `.gitignore` includes:
```
.env.local
.env*.local
node_modules/
.next/
```

---

## Quick Customization Checklist

### Essential Branding
- [ ] Update site name in `app/layout.tsx`
- [ ] Update site name in `components/layout/Header.tsx`
- [ ] Update site name in `components/layout/Footer.tsx`
- [ ] Replace `public/favicon.svg`
- [ ] Replace `public/og-image.svg`
- [ ] Replace `public/avatar.jpg`

### Configuration
- [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env.local`
- [ ] Set `ADMIN_PASSWORD` in `.env.local`
- [ ] Add GitHub credentials in `.env.local`
- [ ] Add Firebase credentials in `.env.local`
- [ ] Update domain in `wrangler.toml`

### SEO
- [ ] Update site description in metadata
- [ ] Update keywords in metadata
- [ ] Set Twitter handle in metadata
- [ ] Update Google Analytics ID
- [ ] Update Open Graph image

### Content
- [ ] Customize home page
- [ ] Update about page
- [ ] Update contact info
- [ ] Update footer links
- [ ] Add social media links

### Styling
- [ ] Change primary color in `app/globals.css`
- [ ] Customize fonts if desired
- [ ] Test responsive design
- [ ] Test light and dark modes

### Deployment
- [ ] Add environment variables to Cloudflare Pages
- [ ] Test admin login on production
- [ ] Test creating a post with image URLs

---

## Troubleshooting

### Images Not Displaying

- Verify image URL is correct and accessible
- Check image URL is HTTPS (not HTTP)
- Try accessing image URL directly in browser
- Ensure image hosting service allows hotlinking

### Admin Login Not Working

- Verify `ADMIN_PASSWORD` is set in `.env.local`
- Check Cloudflare Pages has password in environment variables
- Clear browser cookies and try again
- Try in incognito mode

### Site Not Building

- Check all required environment variables are set
- Run `npm install` to ensure dependencies
- Check Node version is 20+
- Run `npm run lint` to check for errors

### SEO Not Showing Correctly

- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check metadata in browser dev tools
- Use [Open Graph Debugger](https://www.opengraph.xyz/)
- Wait for search engines to re-crawl (can take days)

---

**Version:** 2.0 (Standard Version)
**Last Updated:** November 2025
**Status:** Production Ready

For deployment help, see [SETUP.md](./SETUP.md)
