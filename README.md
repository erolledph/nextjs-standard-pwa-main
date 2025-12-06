# Your Blog - Standard Blogging Platform

A modern, clean blogging platform built with Next.js. Perfect for technical writers, personal bloggers, and small publications who want a simple, distraction-free way to share their content.

## ✨ Features

### Core Blogging Features
- **Clean, Minimal Design** - Focus on content, not distractions
- **GitHub-Based CMS** - Store posts as markdown files in GitHub
- **Admin Dashboard** - Easy-to-use interface for managing posts
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode** - Full dark/light theme support
- **SEO Optimized** - Built-in sitemap, meta tags, and structured data
- **Fast Performance** - Optimized for speed with Cloudflare Pages

### Content Management
- **Rich Markdown Support** - GitHub-flavored markdown with syntax highlighting
- **Featured Images** - Upload and manage post images
- **Post Metadata** - Title, excerpt, author, tags, publication date
- **Full-Text Search** - Search across all blog posts
- **Social Sharing** - Share buttons for popular platforms

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v3, Radix UI components
- **Content**: GitHub (markdown files)
- **Image Hosting**: External URLs (CDN, self-hosted, or any image hosting service)
- **Deployment**: Cloudflare Pages with Edge Runtime
- **Authentication**: Secure session-based admin login

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- GitHub account with a repository
- Cloudflare account (for deployment)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-username/your-blog-repo.git
cd your-blog-repo
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the root directory:

```env
# GitHub Configuration (Required)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-blog-repository
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Access Admin Dashboard
Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and log in with your admin password.

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup and deployment guide
- **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** - How to customize branding, colors, and content

## 📝 How It Works

1. **Create Posts**: Write markdown posts using the admin dashboard at `/admin/dashboard`
2. **Auto-Save**: Posts are automatically saved to your GitHub repository
3. **Auto-Deploy**: Cloudflare Pages automatically rebuilds and deploys when you push to GitHub
4. **Live Immediately**: Your posts go live instantly after deployment

## 🔧 Available Scripts

```bash
npm run dev         # Start development server on port 3000
npm run build       # Create production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run cf:build    # Build for Cloudflare Pages deployment
```

## 📊 Performance

- **TTFB**: ~50ms (with caching)
- **FCP**: <200ms
- **Core Web Vitals**: 90+/100
- **Lighthouse**: 95+/100

## 🚀 Deployment

### Deploy to Cloudflare Pages

1. Push your code to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Create a new Pages project
4. Select your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run cf:build`
   - **Build output directory**: `.vercel/output/static`
6. Add environment variables in Cloudflare dashboard (same as `.env.local`)
7. Click "Deploy"

### Update Custom Domain

In Cloudflare Pages settings, go to "Custom Domain" and add your domain.

See [SETUP.md](./SETUP.md) for detailed instructions.

## 🔐 Security

- **Admin Authentication**: Password-protected admin panel
- **Environment Variables**: All secrets stored in `.env.local` (never commit to git)
- **No Tracking**: Optional analytics (not enabled by default)

## 🎨 Customization

### Site Branding
1. Edit site name in `app/layout.tsx`
2. Update logo/branding in `components/layout/Header.tsx`
3. Change colors in `tailwind.config.ts`
4. Update favicon in `public/favicon.ico`

### Content Pages
1. Edit homepage in `app/page.tsx`
2. Update about page in `app/about/page.tsx`
3. Customize footer in `components/layout/Footer.tsx`
4. Add social links in component headers

See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for complete customization guide.

## 📝 Writing Posts

### Creating a New Post

1. Go to admin dashboard: `yourdomain.com/admin/dashboard`
2. Click "Create New Post"
3. Write your content in markdown
4. Add post metadata (title, excerpt, tags)
5. Upload a featured image (optional)
6. Click "Publish"

### Post Structure

Posts are stored as markdown files in the `posts/` folder:

```markdown
---
title: My Post Title
slug: my-post-title
excerpt: A short summary of the post
date: 2025-01-15
author: Your Name
tags: [tag1, tag2]
image: https://example.com/image.jpg
---

Your post content here in markdown...
```

**Note**: Images are referenced by URL only. You can host images on any external service (CDN, external hosting, or self-hosted). Simply provide the complete image URL when creating or editing posts.

## 🔍 SEO

The platform includes built-in SEO features:
- Automatic sitemap generation at `/sitemap.xml`
- Open Graph tags for social sharing
- Meta descriptions and keywords
- Structured data markup (JSON-LD)
- Mobile-friendly responsive design

## 🐛 Troubleshooting

### Posts not showing up?
- Check that posts are saved in the `posts/` folder on GitHub
- Verify `GITHUB_TOKEN` is valid with repo access
- Wait a few minutes for Cloudflare Pages to rebuild

### Admin dashboard not accessible?
- Check that `ADMIN_PASSWORD` is set in environment variables
- Clear browser cookies and try logging in again
- Verify you're accessing `/admin/login`

### Build fails on Cloudflare?
- Check that all required environment variables are set in Cloudflare dashboard
- Verify GitHub token has repository access
- Check `wrangler.toml` for correct build configuration

## 📄 License

MIT License - Feel free to use this for personal or commercial projects

## 🤝 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with Next.js, TypeScript, Tailwind CSS, and deployed on Cloudflare Pages**
