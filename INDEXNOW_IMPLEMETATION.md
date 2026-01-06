# IndexNow Implementation Guide

This guide explains how to implement **IndexNow** automatic URL submission in a Next.js application. IndexNow is a protocol that allows you to instantly notify search engines (like Bing, Yandex, Naver) about new or updated content.

## Prerequisites

1.  **Generate an API Key**:
    - Go to [Bing Webmaster Tools - IndexNow](https://www.bing.com/indexnow).
    - Click "Generate" to get an API Key.
    - Example Key: `ff4781a1474d46f4a56fb227e2c203d0`

2.  **Host the Verification File**:
    - IndexNow requires a text file to be hosted at the root of your domain to verify ownership.
    - The filename must match the API Key.
    - The content of the file must also be the API Key.

    **Action**: Create a file in your `public/` directory:
    - File: `public/ff4781a1474d46f4a56fb227e2c203d0.txt`
    - Content: `ff4781a1474d46f4a56fb227e2c203d0`

## Step 1: Environment Variables

You need to configure the environment variables for the IndexNow API to work.

### 1. Which Key to Use?

There are two common keys for Bing services, so it's important to use the correct one:

*   **`INDEXNOW_KEY`** (Required for this guide): This is the key you generated specifically for **IndexNow** on the Bing Webmaster Tools "IndexNow" page. It usually looks like a simple alphanumeric string (e.g., `ff4781a1474d46f4a56fb227e2c203d0`). This key **MUST** match the verification file in your `public/` folder.
*   `BING_WEBMASTER_API_KEY` (Not used in this guide): This is a different key used for the older Bing Webmaster APIs. While your project might already have this for other features, **IndexNow** specifically requires the IndexNow key and verification file pair.

### 2. Setting the Variables

#### For Local Development
Create or edit the `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# The key you generated on the IndexNow page
INDEXNOW_KEY=ff4781a1474d46f4a56fb227e2c203d0
```

#### For Cloudflare Pages (Production)
1.  Go to your Cloudflare Dashboard.
2.  Navigate to **Workers & Pages** -> **Overview** -> Select your project.
3.  Go to **Settings** -> **Environment variables**.
4.  Add the following variables:
    *   **Variable name**: `NEXT_PUBLIC_SITE_URL`
        *   **Value**: `https://your-domain.com`
    *   **Variable name**: `INDEXNOW_KEY`
        *   **Value**: `ff4781a1474d46f4a56fb227e2c203d0` (Your actual key)

## Step 2: Create the API Route

Create a server-side API route that handles the submission to IndexNow. This prevents exposing your implementation details to the client.

**File**: `app/api/indexnow/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

const INDEXNOW_API_URL = "https://api.indexnow.org/indexnow"
const INDEXNOW_KEY = process.env.INDEXNOW_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "URLs array is required and must not be empty" },
        { status: 400 }
      )
    }

    if (!INDEXNOW_KEY || !SITE_URL) {
      console.error("Missing configuration: INDEXNOW_KEY or NEXT_PUBLIC_SITE_URL")
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      )
    }

    // The key location must be accessible at the root
    const keyLocation = `${SITE_URL}/${INDEXNOW_KEY}.txt`

    console.log("[IndexNow] Submitting:", {
      host: new URL(SITE_URL).hostname,
      urlCount: urls.length,
      urls: urls,
    })

    // Send request to IndexNow API
    const response = await fetch(INDEXNOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: INDEXNOW_KEY,
        keyLocation: keyLocation,
        urlList: urls,
      }),
    })

    const statusCode = response.status
    const responseText = await response.text()

    if (statusCode === 200 || statusCode === 202) {
      return NextResponse.json(
        {
          success: true,
          message: `Successfully submitted ${urls.length} URL(s) to IndexNow`,
        },
        { status: 200 }
      )
    } else {
      console.error("[IndexNow] Error:", statusCode, responseText)
      return NextResponse.json(
        {
          error: "Failed to submit to IndexNow",
          details: responseText,
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    console.error("[IndexNow] Exception:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
```

## Step 3: Create the Client-Side Helper

Create a utility function to easily call your API route from anywhere in your application.

**File**: `lib/indexnow.ts`

```typescript
/**
 * Submit URLs to IndexNow to notify search engines of new/updated content.
 */
export async function submitToIndexNow(urls: string[]): Promise<{
  success: boolean
  message: string
}> {
  try {
    const response = await fetch("/api/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ urls }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("IndexNow submission failed:", data)
      return {
        success: false,
        message: data.error || "Failed to submit to IndexNow",
      }
    }

    return {
      success: true,
      message: data.message,
    }
  } catch (error) {
    console.error("Error submitting to IndexNow:", error)
    return {
      success: false,
      message: "Network error submitting to IndexNow",
    }
  }
}

/**
 * Helper to submit a single blog post by slug
 */
export async function submitBlogPostToIndexNow(slug: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const url = `${siteUrl}/blog/${slug}`
  return submitToIndexNow([url])
}
```

## Step 4: Integration (Triggering the Submission)

Now you need to call this function when you publish a new post or update an existing one.

In your post creation page (e.g., `app/admin/create/page.tsx`), import the helper and call it after a successful save.

```typescript
// Import the helper
import { submitBlogPostToIndexNow } from "@/lib/indexnow"

// Inside your submit handler function
async function handleSubmit(e: React.FormEvent) {
  // ... existing code to save the post ...

  if (response.ok) {
    // Post saved successfully! Now submit to IndexNow.
    try {
      // Assuming 'slug' is generated or available in the result
      const slug = result.slug

      console.log("Notifying search engines via IndexNow...")
      const indexNowResult = await submitBlogPostToIndexNow(slug)

      if (indexNowResult.success) {
        toast.success("Submitted to search engines!")
      } else {
        console.warn("IndexNow warning:", indexNowResult.message)
      }
    } catch (err) {
      console.error("Failed to submit to IndexNow:", err)
      // Don't block the user flow if IndexNow fails
    }

    // Redirect or update UI
    router.push("/admin/dashboard")
  }
}
```

## Verification

To verify that it's working:

1.  **Check Logs**: Look at your server logs (or Vercel function logs) for `[IndexNow] Submitting:`.
2.  **Bing Webmaster Tools**: Login to Bing Webmaster Tools.
    - Go to **URL Submission** -> **Submitted URLs**.
    - You should see your URLs appear there shortly after submission.

## Common Issues

*   **403 Forbidden**: Usually means the key file is not reachable at `${SITE_URL}/${KEY}.txt`. content-type of that file should be `text/plain`.
*   **422 Unprocessable Entity**: The URL you are submitting does not match the host in the verification file.
*   **429 Too Many Requests**: You are submitting too many URLs too quickly. IndexNow is meant for *new* or *updated* content, not for submitting your entire sitemap every minute.
