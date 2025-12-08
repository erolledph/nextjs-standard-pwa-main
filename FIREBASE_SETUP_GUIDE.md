# Firebase Setup Guide for AI Chef Caching

## Overview
This guide shows how to set up Firestore (Firebase's real-time database) to persistently cache AI-generated recipes and enable pattern learning across users.

## Why Firebase?

✅ **Zero-cost hosting** (Firestore free tier: 1M reads/month)
✅ **Real-time sync** across devices
✅ **Pattern learning** from user behavior
✅ **Analytics** on recipe popularity
✅ **Scalability** with users

## Current Setup in `.env.local`

You already have Firebase credentials:
```
FIREBASE_PROJECT_ID=chef-ai-nunoy
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@chef-ai-nunoy.iam.gserviceaccount.com
```

These are for **Firebase Admin SDK** (server-side).

## Implementation Steps

### Step 1: Install Firebase Packages
```bash
pnpm add firebase firebase-admin
```

### Step 2: Create Firestore Collections

In Firebase Console > Firestore Database, create these collections:

#### Collection: `cached_recipes`
Structure:
```json
{
  "queryHash": "a7f3c2b1",
  "input": {
    "description": "Quick chicken dinner",
    "country": "Thai",
    "protein": "Chicken",
    "taste": ["Spicy"],
    "ingredients": ["Garlic", "Onion", "Tomato"]
  },
  "recipe": {
    "title": "Thai Chicken Stir Fry",
    "servings": 4,
    "ingredients": [...]
  },
  "createdAt": Timestamp,
  "usageCount": 12,
  "lastUsedAt": Timestamp
}
```

#### Collection: `user_preferences` (optional)
```json
{
  "userId": "user123",
  "favorites": ["queryHash1", "queryHash2"],
  "preferences": {
    "favoriteCountries": ["Thai", "Italian"],
    "favoriteProteins": ["Chicken", "Fish"],
    "dislikedIngredients": ["Mushroom"]
  },
  "createdAt": Timestamp
}
```

#### Collection: `recipe_analytics` (optional)
```json
{
  "queryHash": "a7f3c2b1",
  "views": 150,
  "rating": 4.5,
  "cuisine": "Thai",
  "protein": "Chicken",
  "popularity": "trending"
}
```

### Step 3: Update API Endpoint

Replace the mock `CACHED_RECIPES_DB` in `app/api/ai-chef/search/route.ts`:

```typescript
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin
const db = getFirestore()

// In POST handler, replace:
// CACHED_RECIPES_DB[queryHash]

// With:
const docRef = await db.collection('cached_recipes').doc(queryHash).get()
if (docRef.exists) {
  return NextResponse.json({
    source: 'cache_exact',
    recipe: docRef.data().recipe,
    usageCount: docRef.data().usageCount
  })
}
```

### Step 4: Save Results After Generation

```typescript
// After calling Gemini API:
const generatedRecipe = await generateWithGemini(input)

// Save to Firebase
await db.collection('cached_recipes').doc(queryHash).set({
  queryHash,
  input,
  recipe: generatedRecipe,
  createdAt: admin.firestore.Timestamp.now(),
  usageCount: 1,
  lastUsedAt: admin.firestore.Timestamp.now()
}, { merge: true })
```

### Step 5: Search Similar Recipes

```typescript
// After fuzzy matching on client:
const similarities = findBestMatches(userInput, cachedRecipes, 0.7)

// Fetch full recipe details from Firestore:
const fullRecipes = await Promise.all(
  similarities.map(async (match) => {
    const doc = await db.collection('cached_recipes')
      .doc(match.queryHash).get()
    return { ...doc.data(), similarity: match.similarity }
  })
)
```

## Code to Add

### 1. Update `lib/firebase-cache.ts`

```typescript
import { getFirestore, Timestamp, Query } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

// Initialize Firebase (client-side)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function saveCachedRecipe(
  queryHash: string,
  input: any,
  recipe: any
) {
  try {
    await db.collection('cached_recipes').doc(queryHash).set({
      queryHash,
      input,
      recipe,
      createdAt: Timestamp.now(),
      usageCount: 1,
      lastUsedAt: Timestamp.now(),
    })
    console.log('✅ Recipe saved to Firestore')
  } catch (error) {
    console.error('❌ Error saving to Firestore:', error)
  }
}

export async function getCachedRecipe(queryHash: string) {
  try {
    const doc = await db.collection('cached_recipes').doc(queryHash).get()
    if (doc.exists) {
      // Increment usage
      await doc.ref.update({
        usageCount: doc.data().usageCount + 1,
        lastUsedAt: Timestamp.now()
      })
      return doc.data()
    }
    return null
  } catch (error) {
    console.error('❌ Error fetching from Firestore:', error)
    return null
  }
}
```

### 2. Update `.env.local`

Add these Firebase SDK credentials (get from Firebase Console):
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=chef-ai-nunoy.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=chef-ai-nunoy
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=chef-ai-nunoy.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## Firestore Pricing (as of 2024)

**Free Tier:**
- 1M reads/month
- 20k writes/month
- 20k deletes/month

**Typical Usage:**
- 100k API calls/month = ~20k reads (cache hits have few reads)
- Cost: **FREE** on free tier
- Goes over? $0.06 per 100k reads

## Query Examples

### Find Popular Recipes
```typescript
const popular = await db
  .collection('cached_recipes')
  .orderBy('usageCount', 'desc')
  .limit(10)
  .get()
```

### Find Thai Recipes
```typescript
const thai = await db
  .collection('cached_recipes')
  .where('input.country', '==', 'Thai')
  .where('input.protein', '==', 'Chicken')
  .get()
```

### Find Trending This Week
```typescript
const oneWeekAgo = Timestamp.fromDate(
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
)
const trending = await db
  .collection('cached_recipes')
  .where('lastUsedAt', '>', oneWeekAgo)
  .orderBy('lastUsedAt', 'desc')
  .limit(20)
  .get()
```

## Analytics Dashboard (Future)

Once you have data, create a dashboard showing:
- Most popular cuisines
- Most requested proteins
- Most common taste preferences
- Peak usage times
- Cache hit rate (shows ROI!)

## Security Rules

Protect your Firestore with proper rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read cached recipes
    match /cached_recipes/{document=**} {
      allow read: if true;
      // Only server can write (via Admin SDK)
      allow write: if false;
    }
    
    // Only authenticated users can read their own preferences
    match /user_preferences/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Testing

After setup, test with:

```typescript
// In browser console:
fetch('/api/ai-chef/search', {
  method: 'POST',
  body: JSON.stringify({
    description: 'Thai chicken',
    country: 'Thai',
    protein: 'Chicken',
    taste: ['Spicy'],
    ingredients: ['Garlic', 'Onion']
  })
}).then(r => r.json()).then(console.log)
```

Should return cached results from Firestore!

## Next Steps

1. ✅ Firebase credentials already in `.env.local`
2. 📋 Create Firestore collections
3. 🔧 Update API endpoint to use Firestore
4. 🧪 Test with form submission
5. 📊 Monitor usage and cache hit rate
6. 🎯 Build analytics dashboard

## Support

- Firebase Docs: https://firebase.google.com/docs/firestore
- Tutorial: https://firebase.google.com/docs/firestore/quickstart
- Pricing Calculator: https://cloud.google.com/products/calculator
