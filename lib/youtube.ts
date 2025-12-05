// YouTube API V3 Service with Smart Caching & Quota Management
// Free Tier: 10,000 units/day (resets at midnight UTC)

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// Cache configuration
const CACHE_TTL_SECONDS = 21600; // 6 hours for featured videos
const SEARCH_CACHE_TTL_SECONDS = 1800; // 30 minutes for search results

/**
 * YouTube API V3 Quota System
 * 
 * Free Tier: 10,000 units per day (resets at midnight UTC)
 * 
 * Cost breakdown:
 * - search.list: 100 units
 * - videos.list: 1 unit
 * - channels.list: 1 unit
 * 
 * Strategy:
 * - Featured videos: 6-hour cache (2 API calls/day)
 * - Search results: 30-minute cache (48 API calls/day)
 * - Total: ~50 API calls/day = 5,000 quota units (50% reserve)
 */

const QUOTA_CONFIG = {
  DAILY_LIMIT: 10000,
  HOURLY_BUDGET: Math.floor(10000 / 24), // 416 units/hour
  SEARCH_COST: 100,
  VIDEO_COST: 1,
  WARNING_THRESHOLD: 8000, // 80% of 10k
  CRITICAL_THRESHOLD: 9500, // 95% of 10k
};

// Quota tracking
let quotaUsedToday = 0;
let quotaHourly: { [hour: number]: number } = {};
let quotaResetTime = getUTCMidnight();
let lastHourChecked = new Date().getUTCHours();

function getUTCMidnight(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return midnight.getTime();
}

function getCurrentHour(): number {
  return new Date().getUTCHours();
}

function resetHourlyQuotaIfNeeded(): void {
  const currentHour = getCurrentHour();
  if (currentHour !== lastHourChecked) {
    quotaHourly[currentHour] = 0;
    lastHourChecked = currentHour;
    console.log(`[YouTube API] Hourly quota reset. Hour: ${currentHour}`);
  }
}

// In-memory cache store
interface VideoCache {
  data: CookingVideo[] | null;
  timestamp: number;
  etag: string | null;
  quotaUsed: number;
  source: 'api' | 'cache' | 'fallback';
  nextPageToken?: string | null;
}

export interface CookingVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
}

// Search result cache
const searchResultsCache = new Map<string, {
  data: CookingVideo[];
  nextPageToken: string | null;
  timestamp: number;
  source: 'api' | 'cache';
}>();

let videoCacheState: VideoCache = {
  data: null,
  timestamp: 0,
  etag: null,
  quotaUsed: 0,
  source: 'fallback',
};

/**
 * Mock videos for development/fallback
 */
export function getMockVideos(): CookingVideo[] {
  return [
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'Easy Chocolate Chip Cookies Recipe',
      thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/medium.jpg',
      description: 'Learn how to make delicious homemade chocolate chip cookies with this easy step-by-step tutorial.',
      channelTitle: 'Cooking Basics',
      publishedAt: '2023-01-15T10:00:00Z',
    },
    {
      videoId: 'jNQXAC9IVRw',
      title: 'Perfect Pasta Carbonara - Italian Recipe',
      thumbnailUrl: 'https://i.ytimg.com/vi/jNQXAC9IVRw/medium.jpg',
      description: 'Master the classic Italian pasta carbonara with authentic technique and fresh ingredients.',
      channelTitle: 'Italian Cooking',
      publishedAt: '2023-02-20T14:30:00Z',
    },
    {
      videoId: 'E07s5ZFNsHo',
      title: 'Homemade Pizza Dough Tutorial',
      thumbnailUrl: 'https://i.ytimg.com/vi/E07s5ZFNsHo/medium.jpg',
      description: 'Step-by-step guide to making perfect pizza dough from scratch. Tips and tricks included!',
      channelTitle: 'Pizza Master',
      publishedAt: '2023-03-10T09:15:00Z',
    },
    {
      videoId: '9bZkp7q19f0',
      title: 'Thai Green Curry - Restaurant Quality',
      thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/medium.jpg',
      description: 'Create authentic Thai green curry at home with professional cooking techniques.',
      channelTitle: 'Asian Cuisine',
      publishedAt: '2023-04-05T11:45:00Z',
    },
    {
      videoId: 'MNyUw0d5bXY',
      title: 'Sushi Rolling Masterclass',
      thumbnailUrl: 'https://i.ytimg.com/vi/MNyUw0d5bXY/medium.jpg',
      description: 'Learn the art of sushi rolling with expert techniques and fresh ingredients.',
      channelTitle: 'Sushi Chef Academy',
      publishedAt: '2023-05-12T16:20:00Z',
    },
    {
      videoId: 'cRpdIrq7Rbo',
      title: 'Beef Stir Fry - Quick & Easy',
      thumbnailUrl: 'https://i.ytimg.com/vi/cRpdIrq7Rbo/medium.jpg',
      description: 'Fast and delicious beef stir fry recipe perfect for weeknight dinners.',
      channelTitle: 'Quick Meals',
      publishedAt: '2023-06-08T13:00:00Z',
    },
    {
      videoId: 'gQvQvERMoW0',
      title: 'Creamy Salmon Pasta',
      thumbnailUrl: 'https://i.ytimg.com/vi/gQvQvERMoW0/medium.jpg',
      description: 'Elegant and simple salmon pasta with creamy sauce - perfect for special occasions.',
      channelTitle: 'Fine Dining at Home',
      publishedAt: '2023-07-22T10:30:00Z',
    },
    {
      videoId: 'gODZzSOelME',
      title: 'Homemade Bread Baking Guide',
      thumbnailUrl: 'https://i.ytimg.com/vi/gODZzSOelME/medium.jpg',
      description: 'Complete guide to baking perfect artisan bread at home with professional tips.',
      channelTitle: 'Bread Bakers',
      publishedAt: '2023-08-14T15:45:00Z',
    },
    {
      videoId: 'pFUJEm8nTOE',
      title: 'Chicken Tikka Masala Recipe',
      thumbnailUrl: 'https://i.ytimg.com/vi/pFUJEm8nTOE/medium.jpg',
      description: 'Authentic Indian chicken tikka masala made with aromatic spices and cream.',
      channelTitle: 'Indian Cooking',
      publishedAt: '2023-09-03T12:15:00Z',
    },
    {
      videoId: 'Bxc_6fVbPLc',
      title: 'Chocolate Lava Cake - Dessert',
      thumbnailUrl: 'https://i.ytimg.com/vi/Bxc_6fVbPLc/medium.jpg',
      description: 'Impress your guests with this elegant chocolate lava cake recipe.',
      channelTitle: 'Dessert Creations',
      publishedAt: '2023-10-11T14:20:00Z',
    },
    {
      videoId: 'e4NLzh5Pq7Y',
      title: 'Spanish Paella - Traditional Recipe',
      thumbnailUrl: 'https://i.ytimg.com/vi/e4NLzh5Pq7Y/medium.jpg',
      description: 'Learn to cook authentic Spanish paella with seafood and saffron.',
      channelTitle: 'Spanish Cuisine',
      publishedAt: '2023-11-05T17:00:00Z',
    },
    {
      videoId: 'Y2WwLVcVZAA',
      title: 'Vegetable Curry - Vegan Recipe',
      thumbnailUrl: 'https://i.ytimg.com/vi/Y2WwLVcVZAA/medium.jpg',
      description: 'Delicious and healthy vegan vegetable curry packed with flavor and nutrition.',
      channelTitle: 'Plant Based Kitchen',
      publishedAt: '2023-12-02T11:30:00Z',
    },
  ];
}

/**
 * Generate contextual mock videos based on search query
 */
function generateContextualMockVideos(query: string, count: number = 20): CookingVideo[] {
  const mockTitles = [
    `${query} - Easy Recipe`,
    `How to Cook ${query} - Tutorial`,
    `Best ${query} Recipe - Professional`,
    `Quick ${query} - 30 Minutes`,
    `Homemade ${query} - Step by Step`,
    `${query} Masterclass - Chef Guide`,
    `${query} for Beginners`,
    `Restaurant Style ${query}`,
    `Healthy ${query} Recipe`,
    `Traditional ${query} - Authentic`,
    `${query} with Fresh Ingredients`,
    `Pro Tips for ${query}`,
    `${query} Cooking Challenge`,
    `${query} - Multiple Variations`,
    `Street Food ${query} Recipe`,
    `${query} - Budget Friendly`,
    `Crispy ${query} Recipe`,
    `${query} - Kitchen Hack`,
    `Perfect ${query} Every Time`,
    `${query} - Secret Ingredient`,
  ];

  const mockChannels = [
    'Food Channel',
    'Cooking Basics',
    'Chef Academy',
    'Home Chef',
    'Food Network',
    'Kitchen Chronicles',
    'Recipe Masters',
    'Culinary Arts',
    'Food Lab',
    'Pro Cooking',
  ];

  const videos: CookingVideo[] = [];
  for (let i = 0; i < Math.min(count, mockTitles.length); i++) {
    videos.push({
      videoId: `mock_${query.replace(/\s/g, '_')}_${i}`,
      title: mockTitles[i],
      thumbnailUrl: `https://i.ytimg.com/vi/mock_${i}/medium.jpg`,
      description: `Learn how to make delicious ${query} with this comprehensive cooking guide. Perfect for home cooks and beginners.`,
      channelTitle: mockChannels[i % mockChannels.length],
      publishedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return videos;
}

/**
 * Search YouTube for cooking videos with smart caching
 */
export async function searchYouTubeVideos(
  query: string,
  pageToken?: string
): Promise<{ videos: CookingVideo[]; nextPageToken: string | null; source: 'api' | 'cache' | 'fallback' }> {
  try {
    resetHourlyQuotaIfNeeded();

    // Check if API key is configured
    if (!YOUTUBE_API_KEY) {
      console.log('[YouTube API] No API key configured. Using contextual mock data.');
      return {
        videos: generateContextualMockVideos(query, 20),
        nextPageToken: null,
        source: 'fallback',
      };
    }

    // Check cache first
    const cacheKey = `${query}:${pageToken || ''}`;
    const cachedResult = searchResultsCache.get(cacheKey);
    
    if (cachedResult && Date.now() < cachedResult.timestamp + SEARCH_CACHE_TTL_SECONDS * 1000) {
      console.log(`[YouTube API] Serving search "${query}" from cache`);
      return {
        videos: cachedResult.data,
        nextPageToken: cachedResult.nextPageToken,
        source: 'cache',
      };
    }

    // Reset daily quota if new day
    if (Date.now() > quotaResetTime) {
      quotaUsedToday = 0;
      quotaHourly = {};
      quotaResetTime = getUTCMidnight();
      console.log('[YouTube API] ✅ Daily quota reset at UTC midnight');
    }

    // Check quota
    if (quotaUsedToday > QUOTA_CONFIG.CRITICAL_THRESHOLD) {
      console.warn(
        `[YouTube API] 🔴 CRITICAL: ${quotaUsedToday}/${QUOTA_CONFIG.DAILY_LIMIT} quota used. Using contextual mock data.`
      );
      return {
        videos: generateContextualMockVideos(query, 20),
        nextPageToken: null,
        source: 'fallback',
      };
    }

    if (quotaUsedToday > QUOTA_CONFIG.WARNING_THRESHOLD) {
      console.warn(
        `[YouTube API] 🟡 WARNING: ${quotaUsedToday}/${QUOTA_CONFIG.DAILY_LIMIT} quota used (${((quotaUsedToday / QUOTA_CONFIG.DAILY_LIMIT) * 100).toFixed(1)}%).`
      );
      if (cachedResult) {
        console.log('[YouTube API] Using stale cache due to quota concerns');
        return {
          videos: cachedResult.data,
          nextPageToken: cachedResult.nextPageToken,
          source: 'cache',
        };
      }
    }

    // Build search parameters
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      videoCategoryId: '26', // Howto & Style category
      type: 'video',
      maxResults: '20',
      key: YOUTUBE_API_KEY,
      order: 'relevance',
    });

    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    console.log(
      `[YouTube API] Fetching videos for "${query}"... (Quota: ${quotaUsedToday}/${QUOTA_CONFIG.DAILY_LIMIT})`
    );

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.warn(`[YouTube API] YouTube API error: ${response.statusText}. Falling back to mock data.`);
      return {
        videos: generateContextualMockVideos(query, 20),
        nextPageToken: null,
        source: 'fallback',
      };
    }

    const data = await response.json();

    // Track quota usage
    quotaUsedToday += QUOTA_CONFIG.SEARCH_COST;
    quotaHourly[getCurrentHour()] = (quotaHourly[getCurrentHour()] || 0) + QUOTA_CONFIG.SEARCH_COST;

    console.log(
      `[YouTube API] 📊 Quota updated: ${quotaUsedToday}/${QUOTA_CONFIG.DAILY_LIMIT}`
    );

    // Process videos
    const videos: CookingVideo[] = (data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    // Cache the result
    searchResultsCache.set(cacheKey, {
      data: videos,
      nextPageToken: data.nextPageToken || null,
      timestamp: Date.now(),
      source: 'api',
    });

    console.log(`[YouTube API] ✅ Cached ${videos.length} videos for query "${query}"`);

    return {
      videos,
      nextPageToken: data.nextPageToken || null,
      source: 'api',
    };
  } catch (error) {
    console.error('[YouTube API] Error fetching videos:', error);
    // Fallback to contextual mock data on error
    return {
      videos: generateContextualMockVideos(query, 20),
      nextPageToken: null,
      source: 'fallback',
    };
  }
}

/**
 * Get detailed quota status
 */
export function getQuotaStatus(): {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  status: 'ok' | 'warning' | 'critical';
  estimatedSearchesRemaining: number;
  resetIn: string;
} {
  resetHourlyQuotaIfNeeded();

  if (Date.now() > quotaResetTime) {
    quotaUsedToday = 0;
    quotaHourly = {};
    quotaResetTime = getUTCMidnight();
  }

  const now = Date.now();
  const timeUntilReset = quotaResetTime - now;
  const hours = Math.floor(timeUntilReset / (60 * 60 * 1000));
  const minutes = Math.floor((timeUntilReset % (60 * 60 * 1000)) / (60 * 1000));
  const resetIn = `${hours}h ${minutes}m`;

  const limit = QUOTA_CONFIG.DAILY_LIMIT;
  const remaining = Math.max(0, limit - quotaUsedToday);
  const percentUsed = (quotaUsedToday / limit) * 100;
  const estimatedSearchesRemaining = Math.floor(remaining / QUOTA_CONFIG.SEARCH_COST);

  let status: 'ok' | 'warning' | 'critical' = 'ok';
  if (percentUsed > 95) status = 'critical';
  else if (percentUsed > 80) status = 'warning';

  return {
    used: quotaUsedToday,
    limit,
    remaining,
    percentUsed: parseFloat(percentUsed.toFixed(2)),
    status,
    estimatedSearchesRemaining,
    resetIn,
  };
}

/**
 * Get video URLs
 */
export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getVideoEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}
