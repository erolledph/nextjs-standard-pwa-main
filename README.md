# 🌍 World Food Recipes - AI-Powered Global Food Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.2-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps)
[![AI Chef](https://img.shields.io/badge/AI%20Chef-Groq-FF6B35.svg?style=for-the-badge)](https://groq.com)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare%20Pages-F38020.svg?style=for-the-badge&logo=cloudflare)](https://pages.cloudflare.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

**World Food Recipes** is a production-ready **Progressive Web App (PWA)** combining global cuisine with cutting-edge AI technology. Features **AI-powered recipe generation** via Groq, **GitHub-based CMS**, **real-time quota monitoring**, **SEO optimization**, and a **vibrant food community**.

🌐 **Live Demo:** [https://worldfoodrecipes.sbs](https://worldfoodrecipes.sbs)  
📱 **AI Chef:** [https://worldfoodrecipes.sbs/ai-chef](https://worldfoodrecipes.sbs/ai-chef)  
🍽️ **Recipes:** [https://worldfoodrecipes.sbs/recipes](https://worldfoodrecipes.sbs/recipes)

---

## ✨ Key Features

A summary of the core features implemented in this project.

| Category | Feature | Description |
|---|---|---|
| 🤖 **AI Features** | **AI Recipe Generator** | Generate unlimited unique recipes using Groq API. Specify ingredients, cuisine, dietary needs & skill level. |
| | **Smart Search** | Find recipes by ingredients, cuisine, tags, or dietary preferences with advanced filtering. |
| 🍽️ **Content** | **GitHub CMS** | Manages blog and recipe posts as markdown files in a Git repository. |
| | **Admin Dashboard** | Create, edit, and manage content via secure web interface with authentication. |
| | **Full-Text Search** | Instant client-side search across all titles, tags, and content. |
| | **YouTube Integration** | Fetches and displays video content from YouTube API. |
| 📱 **PWA** | **Installable** | Provides a native-app-like experience on desktop and mobile devices. |
| | **Offline Support** | Cached assets and pages are available without internet connection. |
| | **App Shortcuts** | Quick access to key sections like "AI Chef", "Recipes", and "Blog". |
| 🎨 **UX/UI** | **Dark/Light Mode** | System-aware theme with manual toggle, stored in `localStorage`. |
| | **Responsive Design** | Optimized for all screen sizes (mobile-first approach). |
| | **Page Transitions** | Smooth, animated transitions between routes. |
| | **Accessibility** | WCAG 2.1 AA compliant with Radix UI components. |
| 🔍 **SEO** | **Dynamic Sitemap** | Auto-generates `sitemap.xml` for search engines. |
| | **JSON-LD Schema** | Structured data for recipes, blog posts & organization. |
| | **Meta Tags** | OpenGraph + Twitter cards for social sharing with dynamic images. |
| | **Canonical URLs** | Proper canonical link management for duplicate prevention. |
| 🔐 **Security** | **Route Protection** | Middleware secures admin routes and API endpoints. |
| | **CSRF Protection** | Defends against cross-site request forgery. |
| | **Rate Limiting** | Per-IP token bucket algorithm prevents API abuse. |
| | **Security Headers** | Strict CSP and security headers configured. |
| 🚀 **Performance** | **Image Optimization** | Next/Image serves WebP/AVIF with lazy loading. |
| | **ISR & Caching** | Incremental Static Regeneration + in-memory cache. |
| | **Code Splitting** | Automatic route-based splitting & dynamic imports. |
| | **Edge Runtime** | Cloudflare Pages edge function deployment. |
| 📊 **Monitoring** | **Web Vitals** | Tracks Core Web Vitals (LCP, FID, CLS). |
| | **Analytics** | Google Analytics integration for traffic insights. |
| | **Error Tracking** | Comprehensive error handling & logging. |

---

## 🏗️ Architecture & Tech Stack

This project is a monolithic application with a structure that is ready for future microservices extraction.

### Core Technologies

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15.5.2 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5 (Strict Mode) |
| **Styling** | Tailwind CSS 3.4 with Radix UI |
| **Form Handling** | React Hook Form + Zod |
| **State Management**| React Context API |
| **PWA** | `next-pwa` |
| **Deployment** | Cloudflare Pages (Edge Runtime) |
| **Analytics** | Vercel Analytics & Google Analytics |

### Data Flow

Content is fetched from GitHub, parsed, and stored in an in-memory cache to minimize API calls. Pages are statically generated and revalidated using ISR.

```
1. User Request -> Next.js Router
2. Check ISR Cache -> (HIT) Serve Page
                  -> (MISS) Check In-Memory Cache
3. Check In-Memory Cache -> (HIT) Render Page & Update ISR
                         -> (MISS) Fetch from GitHub API
4. Fetch from GitHub -> Parse Markdown -> Store in Memory -> Render Page & Update ISR
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20.0 or higher
- **pnpm** (recommended) or **npm**
- A **GitHub Personal Access Token** with repository read/write access.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/erolledph/nextjs-standard-pwa-main.git
    cd nextjs-standard-pwa-main
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the project root and add the following:
    ```env
    # GitHub Configuration
    GITHUB_OWNER=your-github-username
    GITHUB_REPO=your-forked-repo-name
    GITHUB_TOKEN=ghp_YourGitHubPersonalAccessToken

    # Site & Security
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ADMIN_PASSWORD=your-secure-admin-password
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    Your site will be available at `http://localhost:3000`. The admin panel is at `http://localhost:3000/admin/login`.

---

## 📦 Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates an optimized production build.
- `pnpm start`: Starts the production server.
- `pnpm lint`: Lints the codebase using ESLint.
- `pnpm cf:build`: Builds the project specifically for Cloudflare Pages.
- `pnpm deploy`: Deploys the project to Cloudflare Pages using Wrangler.

---

## 🚢 Deployment

This project is optimized for deployment on **Cloudflare Pages** with edge runtime support.

### Quick Deploy:
1. Push your code to GitHub repository
2. Create new **Cloudflare Pages** project connected to your repo
3. Use build settings:
   - **Build command:** `pnpm cf:build`
   - **Build output:** `.vercel/output/static`
   - **Framework:** Next.js
4. Add environment variables in Cloudflare dashboard
5. Cloudflare auto-deploys on each push to main branch

### Production Environment Variables:
```env
NEXT_PUBLIC_SITE_URL=https://worldfoodrecipes.sbs
NEXT_PUBLIC_BASE_URL=https://worldfoodrecipes.sbs
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
GROQ_API_KEY=your-groq-api-key
GITHUB_TOKEN=your-github-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
ADMIN_PASSWORD=your-secure-password
```

---

## 📊 Recent Improvements & Fixes

### ✅ January 2026 Updates

**SEO & Metadata Enhancements:**
- ✅ Fixed title duplication across all pages with 3-layer protection system
- ✅ Standardized OG image format from `.png` to `.svg` (20 files)
- ✅ Dynamic OG types: 'article' for content, 'website' for others
- ✅ Standardized image dimensions to 1200x630px (optimal for social media)
- ✅ Made recipe schema data dynamic (prepTime, cookTime, servings)
- ✅ Improved canonical URL implementation

**Bug Fixes & Optimizations:**
- ✅ Fixed edge runtime export errors for Cloudflare Pages
- ✅ Resolved server-only import bundling issues with eval() wrapper
- ✅ Standardized localhost port from 3001 → 3000 for API consistency
- ✅ Removed title template auto-appending (identity pattern)
- ✅ Unified title format across all pages (pipe separator)
- ✅ Fixed TypeScript metadata template configuration

**Asset Management:**
- ✅ Verified all public folder assets (icons, images, config)
- ✅ Removed unused files
- ✅ Confirmed all PWA manifest references are correct

**Deployment:**
- ✅ Build compilation: 27.5 seconds
- ✅ All 22/22 static pages generated
- ✅ Type checking: Passed
- ✅ Cloudflare deployment: Success (40 new files, 3.6 MB worker)
- ✅ Live at: https://worldfoodrecipes.sbs

---

## � Documentation

Complete documentation available in project:

| Document | Purpose |
|----------|---------|
| [SOCIAL_POSTS.md](./SOCIAL_POSTS.md) | Social media post templates (Twitter, Facebook, Reddit, LinkedIn) |
| [SEO_AUDIT_PROFESSIONAL_REPORT.md](./SEO_AUDIT_PROFESSIONAL_REPORT.md) | Comprehensive SEO audit & validation |
| [SETUP.md](./SETUP.md) | Detailed setup & configuration guide |
| [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) | Feature implementation status |
| [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) | Pre-deployment verification checklist |

---

## 🤝 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details. You are free to use, modify, and distribute this codebase for personal or commercial projects.

---

## 📧 Support & Contact

Have questions or suggestions? Reach out:
- 📧 Email: hello@worldfoodrecipes.sbs
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

**Made with ❤️ for food lovers everywhere 🌍**