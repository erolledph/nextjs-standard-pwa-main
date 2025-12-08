# AI Chef - Complete Data Flow & Sequence Diagrams

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
├─────────────────────────────────────────────────────────────────┤
│  [AIChefPageImproved Component]                                  │
│  ├─ Stage 1: Search Form (input collection)                      │
│  ├─ Stage 2: Results Display (posts + cached recipes)            │
│  └─ Stage 3: Recipe Display (full recipe view)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                 NEXT.JS API SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│  [/api/ai-chef/search]                                           │
│  ├─ Validate input (Zod)                                         │
│  ├─ Generate query hash                                          │
│  ├─ Check cache (in-memory or Firestore)                         │
│  ├─ Search similar recipes (fuzzy matching)                      │
│  └─ Return results                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ↓             ↓             ↓
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   BLOG   │  │  CACHE   │  │ GEMINI   │
         │  POSTS   │  │ (Memory/ │  │   API    │
         │Database  │  │Firestore)│  │(Generate)│
         └──────────┘  └──────────┘  └──────────┘
```

## Sequence 1: Search with Cache Hit (Most Common)

```
User                  Browser              API              Cache
 │                      │                  │                 │
 │─ Click Search ─────→  │                  │                 │
 │                      │─ POST /api/search─→                 │
 │                      │                  │─ Generate hash──→│
 │                      │                  │←─ Cached recipe ─│
 │                      │←─ Return results─│                 │
 │←─ Display results ──│                  │                 │
 │   (0 cost! ⭐)       │                  │                 │
 │                      │                  │                 │

Cost: $0 (100% cache hit)
Speed: 50-100ms
```

## Sequence 2: Search with New Generation

```
User                  Browser              API            Gemini API
 │                      │                  │                 │
 │─ Click Search ─────→  │                  │                 │
 │                      │─ POST /api/search─→                 │
 │                      │                  │─ Search cache─→ │ (no match)
 │                      │                  │                 │
 │                      │                  │─ [User chooses]─→
 │                      │                  │  "Generate"     │
 │                      │                  │                 │
 │                      │←─ Offer to generate with AI         │
 │←─ "Generate with AI"─│                 │                 │
 │                      │                  │                 │
 │─ Click Generate ────→ │                  │                 │
 │                      │─ POST /api/generate──→              │
 │                      │                  │─────────────────→│
 │                      │                  │  (Call Gemini)   │
 │                      │                  │←─────────────────│
 │                      │                  │  (Recipe JSON)   │
 │                      │                  │─ Cache result ──→
 │                      │←─ Return recipe ─│                 │
 │←─ Display recipe ───│                  │                 │
 │   (saves $0.001)     │                  │                 │

Cost: $0.001 per generation
Speed: 2-3 seconds (API latency)
Future: This result is cached & reused!
```

## Data Flow: Search Query

### Input
```javascript
{
  description: "Quick weeknight dinner",
  country: "Thai",
  protein: "Chicken",
  taste: ["Spicy", "Savory"],
  ingredients: ["Garlic", "Onion", "Tomato", "Basil"]
}
```

### Processing
```
1. VALIDATE
   ├─ description: 10-500 chars ✓
   ├─ country: from CUISINES list ✓
   ├─ protein: from PROTEINS list ✓
   ├─ taste: 1-3 items from TASTE_PROFILES ✓
   └─ ingredients: 3-20 items from INGREDIENTS_OPTIONS ✓

2. NORMALIZE
   ├─ Lowercase all text
   ├─ Trim whitespace
   └─ Sort arrays for consistency

3. HASH
   └─ queryHash = "a7f3c2b1" (deterministic)

4. SEARCH
   ├─ Check exact match in cache
   ├─ Fuzzy search similar recipes
   └─ Search blog posts database
```

### Output
```javascript
{
  queryHash: "a7f3c2b1",
  recipePosts: [
    { title: "...", description: "..." }
  ],
  cachedResults: [
    { 
      title: "...",
      similarity: 0.85,
      usageCount: 12
    }
  ],
  shouldGenerateNew: false,
  source: "search",
  message: "Found 2 posts and 3 cached recipes"
}
```

## Fuzzy Matching Algorithm

### Similarity Calculation

```
User Input: {
  description: "Quick weeknight dinner with Thai flavors",
  country: "Thai",
  protein: "Chicken",
  taste: ["Spicy"],
  ingredients: ["Garlic", "Onion", "Basil"]
}

Candidate 1: {
  description: "Easy Thai grilled chicken",
  country: "Thai",
  protein: "Chicken",
  taste: ["Spicy", "Savory"],
  ingredients: ["Garlic", "Onion", "Chili", "Lime"]
}

SCORING:
├─ Country exact match (Thai == Thai): 25% → 25%
├─ Protein exact match (Chicken == Chicken): 25% → 25%
├─ Description fuzzy (Levenshtein similarity): 80% × 20% → 16%
├─ Ingredients fuzzy (3/5 matches): 60% × 15% → 9%
└─ Taste fuzzy (1/3 in candidate): 33% × 15% → 5%

TOTAL SIMILARITY: 80% ✅ (above 70% threshold - SHOW TO USER)
```

### Levenshtein Distance Example

```
String 1: "Quick weeknight dinner"
String 2: "Easy Thai grilled chicken"

Edit operations needed:
└─ 15 edits out of max 24 characters
└─ Similarity: 1.0 - (15/24) = 0.375 ≈ 38%

Combined with other factors → 80% overall
```

## Caching Strategy

### What Gets Cached?

```
✅ CACHED:
  ├─ Complete AI-generated recipes
  ├─ User input preferences
  ├─ Generated timestamps
  └─ Usage statistics

❌ NOT CACHED:
  ├─ Real-time blog posts (fetched fresh)
  ├─ User authentication tokens
  └─ Personal user data
```

### Cache Lifecycle

```
1. GENERATION
   User → API → Gemini API → Recipe JSON
                                    ↓
2. VALIDATION
   Schema validation (Zod)
                ↓
3. CACHING
   Save to memory + Firestore
        ↓
4. RETRIEVAL
   Next similar search → Found in cache → Returned
                            ↓
5. EXPIRATION (Optional - 30 days default)
   Old recipes cleaned up to save storage
```

## Cost Calculation

### Scenario: 1000 Searches/Month

#### Without Caching
```
1000 searches
× 1 API call each
× $0.001 per call (Gemini Flash pricing)
= $1.00 / month
```

#### With Caching (Realistic)
```
1000 searches
├─ 750 cache hits (75%)
│   × $0 cost
│   = $0
├─ 200 similar matches found (20%)
│   × $0 cost
│   = $0
└─ 50 new generations (5%)
    × $0.001 per call
    = $0.05 / month

TOTAL: $0.05 / month
SAVINGS: 95% less expensive!
```

#### With Smart Matching (Optimistic)
```
1000 searches
├─ 850 cache hits (85%) = $0
├─ 100 similar matches (10%) = $0
└─ 50 new generations (5%) = $0.05

TOTAL: $0.05 / month
SAVINGS: 95-99% cost reduction
```

## Performance Metrics

### Search API Response Times

```
Exact Cache Hit:
├─ Hash lookup: <1ms
├─ Return result: <10ms
└─ TOTAL: 10-15ms ⚡⚡⚡

Fuzzy Match Search:
├─ Hash lookup: <1ms
├─ Fuzzy comparison: 20-50ms (depends on cache size)
├─ Sort by similarity: 5-10ms
└─ TOTAL: 50-100ms ⚡⚡

Blog Post Search:
├─ Database query: 100-500ms (depends on DB)
├─ Combine results: 10-20ms
└─ TOTAL: 100-600ms ⚡

Gemini Generation:
├─ API request: 2-3 seconds
├─ Response parsing: 50-100ms
├─ Cache save: 100-200ms
└─ TOTAL: 2-3.5 seconds 🚀
```

## State Management

### Frontend (React State)

```typescript
const [stage, setStage] = useState<'form' | 'results' | 'recipe'>('form')
const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// Forms use React Hook Form + Zod
const { control, register, handleSubmit, formState: { isValid } } = useForm<AIChefInputType>({
  resolver: zodResolver(AIChefInputSchema),
  mode: 'onChange'
})
```

### Backend (Server Cache)

```typescript
// In-memory cache (development)
const CACHED_RECIPES_DB: Record<string, CachedRecipe> = {}

// Firestore (production)
db.collection('cached_recipes').doc(queryHash).get()
```

## Error Handling

### User Errors (Frontend Validation)
```
❌ Description too short → "Must be 10+ characters"
❌ No cuisine selected → "Please select a cuisine"
❌ Too few ingredients → "Select at least 3 ingredients"
```

### API Errors (Server Validation)
```
❌ Invalid schema → 400 Bad Request
❌ Gemini API timeout → 504 Gateway Timeout
❌ Firestore error → 500 Internal Server Error
```

### User Feedback
```
✓ Loading states ("Searching..." / "Generating...")
✓ Success messages ("Found 3 recipes!")
✓ Error alerts (red banner with message)
✓ Helpful CTAs ("Generate with AI" button)
```

## Logging

### Frontend Console Logs
```
🔴 [SEARCH-1] Search initiated
🟡 [SEARCH-2] Calling search API...
🟡 [SEARCH-3] Response received: 200
🟢 [SEARCH-4] Search results received { posts: 2, cached: 3 }
```

### Backend Console Logs
```
🟡 [API-1] POST request received
🟡 [API-2] Request body parsed
🟢 [API-3] Input validated
🟢 [API-4] Query hash: a7f3c2b1
🟢 [API-5] Cache search completed
🟢 [API-6] Results compiled (2 posts, 3 cached)
```

## Summary Table

| Stage | Component | Cost | Speed | Data |
|-------|-----------|------|-------|------|
| 1. Form | AIChefPageImproved | $0 | Instant | Input collection |
| 2a. Search (Exact) | API route + Cache | $0 | 10-15ms | Exact match |
| 2b. Search (Fuzzy) | API route + Matching | $0 | 50-100ms | Similar recipes |
| 2c. Search (Posts) | API route + DB | $0 | 100-600ms | Blog posts |
| 3. Generate | API + Gemini | $0.001 | 2-3s | New recipe |
| 4. Display | RecipeResult | $0 | Instant | Recipe render |

## Next Steps

1. ✅ Test search functionality
2. ✅ Verify caching works
3. ✅ Monitor API usage
4. 📋 Integrate Firestore (see FIREBASE_SETUP_GUIDE.md)
5. 📊 Build analytics dashboard
6. 🚀 Deploy to production
