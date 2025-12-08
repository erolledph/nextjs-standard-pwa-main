# World Food Recipes - PWA Food Blog & Recipe Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.2-black)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.0.0-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8)](https://web.dev/progressive-web-apps)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-95%2B-green)](https://developers.google.com/web/tools/lighthouse)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, production-ready **Progressive Web App (PWA)** food blog and recipe platform built with **Next.js 15**, **React 19**, and **TypeScript**. Features GitHub-based CMS, offline support, install app capability, and comprehensive SEO optimization.

🌐 **Live Demo:** [World Food Recipes](https://worldfoodrecipes.sbs)  
📚 **Documentation:** See [CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md) & [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)

---

## ✨ Key Features

### 🍽️ Content Management
- **GitHub as CMS** - Store recipes and blog posts as markdown files
- **Rich Markdown Support** - GitHub-flavored markdown with syntax highlighting
- **Admin Dashboard** - Intuitive interface for creating and managing content
- **Recipe & Blog Posts** - Separate content types with customizable metadata
- **Tags & Categories** - Organize content with flexible tagging system
- **Full-Text Search** - Real-time search across all recipes and blog posts

### 📱 Progressive Web App (PWA)
- **Installable** - Install as native app on iOS, Android, Windows, macOS
- **Offline Support** - Browse cached content without internet
- **App Shortcuts** - Quick access to latest posts and admin
- **Custom Icons** - Orange fork & knife branding throughout
- **Install CTA** - Responsive install button in header (hidden when installed)

### 🎨 Design & UX
- **Responsive Design** - Perfect on mobile, tablet, desktop
- **Dark/Light Theme** - System-aware dark mode with manual toggle
- **Smooth Animations** - Page transitions and interactive elements
- **Accessibility** - WCAG 2.1 Level AA compliant
- **Performance** - Optimized images (WebP, AVIF), lazy loading

### 🔍 SEO & Analytics
- **Dynamic Sitemap** - Auto-generated `/sitemap.xml` (revalidates hourly)
- **robots.txt** - Search engine crawler configuration
- **JSON-LD Schema** - Structured data (Organization, Website)
- **Meta Tags** - OpenGraph and Twitter card support
- **Google Analytics** - Integrated with ID: G-SDNJH7W92S
- **Web Vitals Tracking** - Core Web Vitals monitoring

### 🔐 Security & Performance
- **Admin Authentication** - Secure session-based login
- **CSRF Protection** - Token-based CSRF prevention
- **Security Headers** - X-Frame-Options, CSP, XSS Protection
- **Rate Limiting** - API endpoint protection
- **Image Optimization** - WebP/AVIF formats, responsive sizing
- **Code Splitting** - Efficient bundle with tree-shaking

### 📊 Integration & Tools
- **YouTube Integration** - Embed and display YouTube videos
- **Video Content** - Dedicated video gallery page
- **Favorites System** - Bookmark and save favorite recipes
- **Comments Ready** - Infrastructure for future comments
- **Analytics Dashboard** - View cache stats and API quotas

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js App Router | 15.5.2 |
| **Runtime** | React with Hooks | 19.0.0 |
| **Language** | TypeScript | 5 (strict) |
| **Styling** | Tailwind CSS | 3.4 |
| **UI Components** | Radix UI | Latest |
| **Form Handling** | React Hook Form + Zod | Latest |
| **CMS** | GitHub API | N/A |
| **Hosting** | Cloudflare Pages | Edge Runtime |
| **PWA** | next-pwa | 5.6.0 |
| **Analytics** | Google Analytics 4 | G-SDNJH7W92S |

### Directory Structure

```
world-food-recipes/
├── app/                              # Next.js App Router
│   ├── admin/                        # Protected admin routes
│   │   ├── dashboard/                # Admin dashboard
│   │   ├── create/                   # Create new post
│   │   ├── edit/[slug]/              # Edit existing post
│   │   └── login/                    # Admin login
│   ├── api/                          # API routes
│   │   ├── auth/                     # Authentication endpoints
│   │   ├── posts/                    # Blog post management
│   │   ├── recipes/                  # Recipe management
│   │   ├── search/                   # Search functionality
│   │   ├── videos/                   # Video integration
│   │   └── cache-stats/              # Cache monitoring
│   ├── blog/                         # Blog pages
│   ├── recipes/                      # Recipe pages
│   ├── videos/                       # Video gallery
│   ├── search/                       # Search page
│   ├── tags/                         # Tag-based filtering
│   ├── favorites/                    # Bookmarked content
│   ├── layout.tsx                    # Root layout with SEO
│   ├── globals.css                   # Global styles
│   ├── robots.ts                     # robots.txt generation
│   └── sitemap.ts                    # sitemap.xml generation
├── components/                       # React components
│   ├── layout/                       # Layout components
│   │   ├── Header.tsx                # Navigation + install CTA
│   │   ├── Footer.tsx                # Footer
│   │   └── BottomNav.tsx             # Mobile bottom navigation
│   ├── blog/                         # Blog components
│   │   ├── BlogPostCard.tsx
│   │   ├── BlogPostSkeleton.tsx
│   │   └── RelatedPosts.tsx
│   ├── pages/                        # Page-specific components
│   ├── pwa/                          # PWA components
│   │   ├── PWAProvider.tsx           # PWA initialization
│   │   └── InstallPrompt.tsx         # Install prompt (now in header)
│   └── ui/                           # Reusable UI components
├── lib/                              # Utilities & helpers
│   ├── auth.ts                       # Admin authentication
│   ├── cache.ts                      # In-memory caching
│   ├── github.ts                     # GitHub API integration
│   ├── seo.ts                        # SEO configuration
│   ├── pwa.ts                        # PWA utilities
│   ├── youtube.ts                    # YouTube integration
│   ├── validation.ts                 # Form validation (Zod)
│   └── useWebVitals.ts               # Performance monitoring
├── posts/                            # Content (markdown files)
│   ├── blog/                         # Blog posts
│   └── recipes/                      # Recipe posts
├── public/                           # Static assets
│   ├── favicon.svg                   # Site favicon (fork & knife)
│   ├── icon-*.png                    # PWA icons (192x512)
│   ├── apple-touch-icon.png          # iOS icon
│   ├── manifest.json                 # PWA manifest
│   └── og-image.svg                  # Social sharing
├── middleware.ts                     # Route protection
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── package.json                      # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ or **pnpm** 10+
- **GitHub Account** - For content storage
- **GitHub Personal Token** - For API access ([Create token](https://github.com/settings/tokens))
- **Cloudflare Account** (optional) - For deployment

### Installation

1. **Clone Repository**
   ```bash
   git clone https://github.com/erolledph/nextjs-standard-pwa-main.git
   cd nextjs-standard-pwa-main
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure Environment Variables**
   
   Create `.env.local` in the root directory:
   ```env
   # GitHub Configuration (Required)
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=your-repo-name
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ADMIN_PASSWORD=your-secure-password-here
   ```

4. **Run Development Server**
   ```bash
   pnpm dev
   # Visit: http://localhost:3000
   ```

5. **Access Admin Dashboard**
   - URL: `http://localhost:3000/admin/login`
   - Password: Enter the value of `ADMIN_PASSWORD`

---

## 📖 Usage

### Creating Blog Posts

1. Go to `/admin/dashboard`
2. Click "Create New Post"
3. Write in markdown with front matter:
   ```markdown
   ---
   title: "Post Title"
   date: "2025-12-06"
   author: "Your Name"
   tags: ["tag1", "tag2"]
   excerpt: "Brief description"
   image: "https://example.com/image.jpg"
   ---
   
   Your content here...
   ```
4. Click "Publish" - automatically commits to GitHub

### Creating Recipes

1. Navigate to `/admin/dashboard`
2. Click "Create New Recipe"
3. Similar markdown format with recipe-specific fields
4. Recipes appear on `/recipes` page and in search

### Customizing Colors & Branding

**Orange Theme (#FF7518):**
- Update `app/globals.css` for CSS variables
- Edit `tailwind.config.ts` for Tailwind colors
- Replace `public/favicon.svg` for custom icon
- Update site name in `lib/seo.ts`

### Adding Custom Pages

1. Create folder in `app/` (e.g., `app/my-page/`)
2. Add `page.tsx` with your content
3. Update `components/layout/Header.tsx` for navigation

---

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Start dev server on port 3000

# Production
pnpm build            # Create optimized production build
pnpm start            # Start production server

# Deployment
pnpm cf:build         # Build for Cloudflare Pages
pnpm deploy           # Deploy to Cloudflare Pages (with wrangler)

# Utilities
pnpm lint             # Run ESLint
pnpm preview          # Preview build locally
```

---

## 🚢 Deployment

### Deploy to Cloudflare Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy update"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Create new Pages project
   - Select your GitHub repository
   - Build settings:
     - **Framework**: Next.js
     - **Build command**: `pnpm cf:build`
     - **Build output directory**: `.vercel/output/static`

3. **Add Environment Variables**
   - In Cloudflare Pages settings → Environment variables
   - Add all variables from `.env.local`

4. **Custom Domain**
   - In Pages settings → Custom domain
   - Add your domain (e.g., `worldfoodrecipes.sbs`)

**Auto-deploy on Push:** Every GitHub push automatically triggers a rebuild!

---

## 🔐 Security

- ✅ **Admin Authentication** - Session-based password protection
- ✅ **CSRF Protection** - Token validation on mutations
- ✅ **Security Headers** - CSP, X-Frame-Options, XSS-Protection
- ✅ **Rate Limiting** - Per-IP API endpoint limits
- ✅ **Environment Secrets** - Never commit sensitive data
- ✅ **TypeScript Strict Mode** - Type safety throughout

**Recommended:** Use strong `ADMIN_PASSWORD` and rotate GitHub tokens regularly.

---

## ⚡ Performance

### Metrics (Expected)

| Metric | Score | Details |
|--------|-------|---------|
| **Performance** | 95-100 | Optimized images, lazy loading, code splitting |
| **Accessibility** | 98-100 | WCAG 2.1, semantic HTML, ARIA labels |
| **Best Practices** | 97-100 | Modern standards, no deprecated APIs |
| **SEO** | 98-100 | Structured data, mobile-friendly, sitemap |

### Optimizations

- **Image Processing** - WebP/AVIF with responsive sizing
- **Caching Strategy** - ISR (1 hour), memory cache, CDN
- **Bundle Size** - ~150KB with tree-shaking
- **Code Splitting** - Route-based automatic splitting
- **CSS Purging** - Tailwind removes unused styles

---

## 🌐 PWA Features

### Mobile App Experience

- **Install Prompt** - Header CTA with install button
- **Offline Mode** - Service worker caches essential content
- **App Icon** - Custom orange fork & knife icon
- **Standalone Mode** - Full-screen immersive experience
- **iOS Support** - Works on iPhone/iPad
- **Android Support** - Install from Chrome menu

### Install Steps

**Desktop:**
1. Click "Install App" button in header
2. Browser shows install prompt
3. Choose to install to desktop

**Mobile:**
1. Visit site in browser
2. Click "Install App" button
3. Select "Add to Home Screen" (iOS) or "Install" (Android)

---

## 📊 SEO Features

- ✅ Dynamic sitemap generation (`/sitemap.xml`)
- ✅ robots.txt for crawler guidance
- ✅ JSON-LD structured data (Organization, Website)
- ✅ OpenGraph & Twitter card metadata
- ✅ Responsive mobile-first design
- ✅ Fast page load times
- ✅ Semantic HTML markup
- ✅ Canonical URLs

---

## 🐛 Troubleshooting

### Development Issues

| Issue | Solution |
|-------|----------|
| Posts not showing | Check GitHub token and `posts/` folder structure |
| Build fails | Verify Node.js version (20+), run `pnpm install` |
| Admin login fails | Clear browser cookies, check `ADMIN_PASSWORD` in `.env.local` |
| Images not loading | Verify image URLs are publicly accessible |
| Dark mode not working | Clear browser cache and localStorage |

### Deployment Issues

| Issue | Solution |
|-------|----------|
| Build fails on Cloudflare | Ensure all env vars are set in Cloudflare dashboard |
| Site shows old content | Wait for Cloudflare cache to clear (max 5 min) |
| GitHub API rate limited | Use personal token or wait 1 hour for reset |
| Deploy stuck | Check GitHub Actions logs and Cloudflare build logs |

---

## 📚 Additional Documentation

- **[CODEBASE_ANALYSIS.md](./CODEBASE_ANALYSIS.md)** - Comprehensive architecture & code breakdown
- **[PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)** - Deployment readiness checklist
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** - Branding & styling guide

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects. See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to:
- Report issues
- Suggest improvements
- Submit pull requests

---

## 📞 Support & Contact

- **Issues:** [GitHub Issues](https://github.com/erolledph/nextjs-standard-pwa-main/issues)
- **Email:** hello@worldfoodrecipes.sbs
- **Twitter:** [@worldfoodrecipes](https://twitter.com/worldfoodrecipes)

---

## 🎯 Roadmap

### Upcoming Features
- [ ] Comments system (Disqus/native)
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Video transcoding
- [ ] Multi-language support
- [ ] Patreon/subscription integration

### Improvements
- [ ] Unit & E2E tests
- [ ] Database for analytics
- [ ] Elasticsearch integration
- [ ] Admin API documentation
- [ ] CI/CD pipeline optimization

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org) - React framework
- [React](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Radix UI](https://www.radix-ui.com) - Accessible components
- [Cloudflare Pages](https://pages.cloudflare.com) - Hosting
- [GitHub](https://github.com) - CMS & version control

---

<div align="center">

**Made with ❤️ for food lovers worldwide**

[Visit Site](https://worldfoodrecipes.sbs) • [GitHub](https://github.com/erolledph/nextjs-standard-pwa-main) • [Report Issue](https://github.com/erolledph/nextjs-standard-pwa-main/issues)

</div>
.
