# 🌍 World Food Recipes - PWA & Blog Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5.2-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps)
[![AI Chef](https://img.shields.io/badge/AI%20Chef-Groq-FF6B35.svg?style=for-the-badge)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

**World Food Recipes** is a production-ready, high-performance **Progressive Web App (PWA)** serving as a comprehensive platform for sharing recipes and blog posts with **AI-powered recipe generation**, **real-time quota monitoring**, and a **GitHub-based CMS**.

🌐 **Live Demo:** [worldfoodrecipes.sbs](https://worldfoodrecipes.sbs)

---

## ✨ Key Features

A summary of the core features implemented in this project.

| Category | Feature | Description |
|---|---|---|
| 🍽️ **Content** | **GitHub as CMS** | Manages blog and recipe posts as markdown files in a Git repository. |
| | **Admin Dashboard** | Create, edit, and manage content via a secure web interface. |
| | **Full-Text Search** | Instant client-side search across all titles, tags, and content. |
| | **YouTube Integration** | Fetches and displays video content from the YouTube API. |
| 📱 **PWA** | **Installable** | Provides a native-app-like experience on desktop and mobile. |
| | **Offline Support** | Cached assets and pages are available without an internet connection. |
| | **App Shortcuts** | Quick access to key sections like "New Post" or "Search". |
| 🎨 **UX/UI** | **Dark/Light Mode** | System-aware theme with a manual toggle, stored in `localStorage`. |
| | **Responsive Design** | Optimized for all screen sizes using Tailwind CSS. |
| | **Page Transitions** | Smooth, animated transitions between routes. |
| | **Accessibility** | WCAG 2.1 AA compliant with Radix UI for accessible components. |
| 🔍 **SEO** | **Dynamic Sitemap** | Automatically generates `sitemap.xml` for search engines. |
| | **JSON-LD Schema** | Provides structured data for better search result visibility. |
| | **Meta Tags** | Complete OpenGraph and Twitter card support for social sharing. |
| 🔐 **Security** | **Route Protection** | Middleware secures all admin routes and API endpoints. |
| | **CSRF Protection** | Defends against cross-site request forgery on all form submissions. |
| | **Rate Limiting** | Per-IP token bucket algorithm to prevent API abuse. |
| | **Security Headers** | Enforces a strict Content Security Policy and other security headers. |
| 🚀 **Performance** | **Image Optimization** | `Next/Image` serves optimized WebP/AVIF formats and lazy loads images. |
| | **ISR & Caching** | Uses Incremental Static Regeneration and an in-memory cache for speed. |
| | **Code Splitting** | Automatic route-based code splitting and dynamic imports. |

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

This project is optimized for deployment on **Cloudflare Pages**.

1.  **Push your code to your GitHub repository.**
2.  In the Cloudflare dashboard, create a new **Pages** project and connect it to your repository.
3.  Use the following build settings:
    - **Build command:** `pnpm cf:build`
    - **Build output directory:** `.vercel/output/static`
    - **Framework preset:** Next.js
4.  Add your environment variables from `.env.local` to the Cloudflare project settings.

Cloudflare will automatically build and deploy your site upon each push to the main branch.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details. You are free to use, modify, and distribute this codebase for personal or commercial projects.