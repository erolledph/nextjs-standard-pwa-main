# Setup Guide

Complete guide to set up and deploy your blogging platform

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [GitHub Configuration](#github-configuration)
4. [Admin Authentication Setup](#admin-authentication-setup)
5. [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: v20 or higher ([Download](https://nodejs.org/))
- **npm**: v10 or higher (comes with Node.js)
- **Git**: Latest version
- **GitHub Account**: For repository and content storage
- **Cloudflare Account**: For deployment ([https://cloudflare.com](https://cloudflare.com))

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/your-blog-repo.git
cd your-blog-repo
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, and other dependencies.

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub Configuration (Required)
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-blog-repository
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=your-secure-password
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## GitHub Configuration

### Creating a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it something descriptive (e.g., "Blog CMS")
4. Select these scopes:
   - `repo` - Full control of private repositories
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Add to `.env.local` as `GITHUB_TOKEN`

### Repository Structure

Your GitHub repository stores blog posts as markdown files:

```
your-repo/
├── app/                  # Next.js application code
├── components/          # React components
├── lib/                 # Utility functions
├── posts/              # Blog posts (markdown files)
│   ├── getting-started.md
│   ├── my-first-post.md
│   └── another-post.md
├── public/             # Static files
├── .env.local          # Environment variables (don't commit!)
├── wrangler.toml       # Cloudflare Pages config
├── package.json
└── README.md
```

### Blog Post Format

Blog posts are markdown files with YAML frontmatter:

```markdown
---
title: "Your Blog Post Title"
date: "2025-01-15"
author: "Your Name"
excerpt: "A brief description of your post"
tags: "tag1, tag2, tag3"
image: "https://example.com/image.jpg"
---

# Your Blog Post Title

Your post content goes here in Markdown format.

## Section

More content...
```

**Required Fields:**
- `title` - Post title
- `date` - Publication date (YYYY-MM-DD format)
- `author` - Author name
- `excerpt` - Short description
- `tags` - Comma-separated tags
- `image` - Featured image URL (optional)

## Admin Authentication Setup

### Create Admin Credentials

The admin panel is protected with a password. Set it in `.env.local`:

```env
ADMIN_PASSWORD=your-secure-password
```

Use a strong password (mix of uppercase, lowercase, numbers, special characters).

### Access the Admin Dashboard

1. Local development: `http://localhost:3000/admin/login`
2. Production: `https://yourdomain.com/admin/login`
3. Enter your admin password
4. Features available:
   - **Overview**: Dashboard with quick stats
   - **Create Post**: Write new blog posts with markdown editor
   - **Edit Post**: Modify existing posts
   - **Delete Post**: Remove posts

## Cloudflare Pages Deployment

### Step 1: Connect Your Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click "Create a project"
3. Select "Connect to Git"
4. Authorize Cloudflare to access your GitHub account
5. Select your blog repository
6. Click "Begin setup"

### Step 2: Configure Build Settings

Set these values in the Pages configuration:

- **Framework preset**: Next.js
- **Build command**: `npm run cf:build`
- **Build output directory**: `.vercel/output/static`

### Step 3: Add Environment Variables

In the Cloudflare Pages project settings:

1. Go to **Settings** → **Environment variables**
2. Add these variables for production:
   ```
   GITHUB_OWNER=your-username
   GITHUB_REPO=your-blog-repository
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx
   ADMIN_PASSWORD=your-secure-password
   NEXT_PUBLIC_SITE_URL=https://your-site.pages.dev
   ```

### Step 4: Deploy

1. Click "Save and Deploy"
2. Cloudflare Pages builds and deploys your site
3. View your site at `https://your-site.pages.dev`

### Future Deployments

Every time you push to your main branch:
1. Cloudflare Pages detects the push
2. Automatically builds your site
3. Deploys the new version

You can also trigger manual deployments from the Cloudflare Pages dashboard.

### Custom Domain

To use your own domain:

1. In Cloudflare Pages, go to **Custom domains**
2. Add your domain
3. Follow the DNS setup instructions
4. Update `NEXT_PUBLIC_SITE_URL` environment variable with your domain

## Troubleshooting

### Build Failures

**Error: "Module not found" or build fails**

Solution:
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### GitHub Issues

**Error: "Repository not found" or "403 Forbidden"**

Solution:
- Verify `GITHUB_OWNER` and `GITHUB_REPO` are correct
- Ensure repository exists and is accessible
- Check GitHub token has `repo` scope
- Token must have correct permissions for your repository

**Error: "GitHub API rate limit exceeded"**

Solution:
- GitHub Personal Access Token allows 5,000 requests/hour
- Rate limits reset hourly
- Ensure you're using a token (not unauthenticated)

### Admin Panel Issues

**Cannot log into admin panel**

Solution:
- Verify `ADMIN_PASSWORD` is set in environment variables
- Clear browser cookies and try again
- Check browser console for errors
- Restart development server (if local)

**Admin pages redirect to login immediately**

Solution:
- Session may have expired (24-hour timeout)
- Clear cookies and log in again
- Verify `ADMIN_PASSWORD` is set correctly in environment variables

### Posts Not Showing

**Posts not appearing on site**

Solution:
- Verify posts are in the `posts/` folder on GitHub
- Check post files are valid markdown with correct frontmatter
- Verify `GITHUB_TOKEN` has read access to the repository
- Wait for Cloudflare Pages build to complete
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### Deployment Issues

**Changes not showing on live site**

Solution:
1. Verify changes were committed and pushed to main branch
2. Check Cloudflare Pages "Deployments" tab for build status
3. Wait for build to complete (check logs for errors)
4. Hard refresh browser to clear cache
5. Verify all environment variables are set in Cloudflare Pages

## Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Create production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run cf:build    # Build for Cloudflare Pages
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_OWNER` | Yes | Your GitHub username | `johndoe` |
| `GITHUB_REPO` | Yes | Your repository name | `my-blog` |
| `GITHUB_TOKEN` | Yes | GitHub Personal Access Token | `ghp_xxxx` |
| `ADMIN_PASSWORD` | Yes | Admin panel password | `my-secure-pass` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your site URL | `https://myblog.pages.dev` |

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Markdown Guide](https://www.markdownguide.org/)

---

**Need help? Check the troubleshooting section above or create an issue on GitHub.**
