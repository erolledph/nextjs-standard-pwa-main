# Recipe Images Implementation Guide

## Overview
This document outlines the implementation of recipe image fetching for AI-generated recipes using the Unsplash API. Images are automatically fetched based on recipe titles and cuisine types, with comprehensive fallback strategies to ensure no broken images appear.

## Features Implemented

### 1. **Image Service** (`lib/recipeImages.ts`)
Centralized image fetching service with:
- **Unsplash API Integration**: Primary image source (50 requests/hour free tier)
- **Smart Fallback Chain**: 
  - `[recipe title + cuisine]` → `[recipe title]` → `[cuisine food]` → `[food]`
- **URL Validation**: HEAD requests verify images are accessible before returning
- **24-Hour Caching**: In-memory cache prevents redundant API calls
- **Cuisine-Specific Defaults**: Fallback to curated Unsplash URLs by cuisine type
- **Attribution**: Returns photographer name and credit for images

### 2. **Recipe Display** (`components/ai-chef/RecipeResult.tsx`)
Visual integration updates:
- **Hero Image**: 800x500px responsive image displayed above recipe title
- **Automatic Fetching**: useEffect fetches image on component mount
- **Error Handling**: Graceful fallback to placeholder if image fails to load
- **Loading State**: Tracks image loading status with `imageLoaded` state
- **Accessibility**: Proper alt text and attribution

### 3. **Shared Recipe SEO** (`app/ai-chef/[slug]/page.tsx`)
Meta tags integration:
- **generateMetadata() Function**: Async metadata generation at request time
- **Dynamic OG Images**: Uses `getRecipeImage()` to fetch recipe images
- **Twitter Card Support**: `summary_large_image` cards with recipe image
- **JSON-LD Schema**: Recipe structured data for search engines
- **Canonical URLs**: Proper URL canonicalization in alternates

## Configuration

### 1. Add Unsplash API Key
Update `.env.local`:
```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

Replace `your_unsplash_access_key_here` with your actual Unsplash API key from https://unsplash.com/oauth/applications

### 2. Verify Environment Variables
The following must be set in `.env.local`:
- `UNSPLASH_ACCESS_KEY` - Unsplash API access token (NEW)
- `NEXT_PUBLIC_BASE_URL` - Base URL for shared recipe links (existing)

## API Endpoints

### Get Recipe Image
**Function**: `getRecipeImage(title: string, cuisine: string)`
```typescript
const image = await getRecipeImage('Pasta Carbonara', 'Italian')
// Returns: { url: string, photographer: string }
```

### Fallback Chain Logic
1. Query: `"Pasta Carbonara Italian food"`
2. Query: `"Pasta Carbonara"`
3. Query: `"Italian food"`
4. Default: Cuisine-specific Unsplash URL (e.g., Italian default)
5. Final Fallback: `placeholder.co` generic food image

## File Changes Summary

### New Files
- `lib/recipeImages.ts` - Complete image service (190+ lines)
- `.env.local` - Updated with UNSPLASH_ACCESS_KEY

### Modified Files
- `components/ai-chef/RecipeResult.tsx` - Added image display with state management
- `app/ai-chef/[slug]/page.tsx` - Integrated image fetching for metadata generation

## Rate Limiting

Unsplash Free Tier:
- **Limit**: 50 requests/hour
- **Mitigation**: 24-hour in-memory caching reduces API calls
- **Impact**: Most recipes will use cached images after first generation

## Testing Checklist

- [ ] Generate a new AI recipe and verify image displays
- [ ] Share recipe via social media and verify rich preview with image
- [ ] Test with various cuisines (Italian, Asian, Mexican, etc.)
- [ ] Verify broken image URLs fallback to defaults
- [ ] Check mobile responsive image display
- [ ] Validate image attribution appears below image
- [ ] Monitor Unsplash API rate limit usage

## Troubleshooting

### Images Not Displaying
1. Verify `UNSPLASH_ACCESS_KEY` is set in `.env.local`
2. Restart development server: `pnpm dev`
3. Check browser console for fetch errors
4. Verify Unsplash API quota hasn't been exceeded

### Broken Image URLs
The service automatically validates images with HEAD requests. If broken URLs occur:
1. Service falls back to next query in chain
2. If all fail, uses cuisine-specific default
3. Final fallback is placeholder.co generic image

### Performance Issues
If performance degradation occurs:
1. Increase cache TTL in `getRecipeImage()` (line 25 in recipeImages.ts)
2. Reduce image fetch parallelization
3. Consider caching images in CDN/database for production

## Production Deployment

Before deploying to Cloudflare Pages:
1. **Ensure UNSPLASH_ACCESS_KEY is set** in Cloudflare environment variables
2. **Test shared recipe links** with social media preview tools (Facebook Debugger, Twitter Card Validator)
3. **Monitor image load times** - ensure images load within 2 seconds
4. **Cache strategy** - Consider implementing persistent caching for frequently shared recipes

## Architecture Decisions

### Why Unsplash?
- Free tier available (50 req/hour)
- High-quality food photography
- Proper licensing for commercial use
- Direct API access

### Why In-Memory Caching?
- Reduces Unsplash API calls during development
- Faster repeated image fetches
- 24-hour TTL balances freshness with performance

### Why Multiple Fallbacks?
- AI recipes may have unique titles
- Ensures every recipe gets an image
- Cuisine fallback provides contextually appropriate images
- Graceful degradation prevents 404 errors

## Future Enhancements

1. **Persistent Database Caching**: Store image URLs in Firestore
2. **Image Optimization**: Serve images via CDN with WebP format
3. **User Upload**: Allow users to upload custom recipe images
4. **Pinterest Integration**: Auto-pin recipes with images to Pinterest
5. **Custom Image Generation**: Generate images via AI (DALL-E, Midjourney)

## Support & Resources

- **Unsplash API Docs**: https://unsplash.com/documentation
- **Next.js Image Component**: https://nextjs.org/docs/app/api-reference/components/image
- **OG Image Testing**: https://www.opengraph.xyz/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
