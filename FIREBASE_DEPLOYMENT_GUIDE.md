# Firebase Deployment Guide

This guide explains how to deploy the Firestore rules and indexes for the AI Recipe application.

## Prerequisites

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Authenticate with Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (if not already done):
```bash
firebase init firestore
```

## Files Included

- **`firebase.rules`** - Firestore security rules defining access control
- **`firestore.indexes.json`** - Composite indexes for optimized queries

## Deployment Instructions

### Option 1: Deploy Everything (Recommended)

```bash
firebase deploy --only firestore
```

This command will deploy both:
- Security rules from `firebase.rules`
- Composite indexes from `firestore.indexes.json`

### Option 2: Deploy Only Rules

```bash
firebase deploy --only firestore:rules
```

### Option 3: Deploy Only Indexes

```bash
firebase deploy --only firestore:indexes
```

## What Gets Deployed

### Security Rules (`firebase.rules`)

#### Collections Configured:

1. **`cached_recipes`** - AI recipe response cache
   - ✅ Public read access (caching layer)
   - ❌ Write-only via Admin SDK
   - Used for: Storing API responses to reduce repeated calls

2. **`recipes`** - Recipe post cache
   - ✅ Authenticated read access
   - ❌ Write-only via Admin SDK
   - Used for: Caching recipe posts from GitHub

3. **`ai_recipes`** - Generated recipes storage
   - ✅ Published recipes: Public read
   - ✅ Unpublished recipes: Authenticated read only
   - ❌ Write-only via Admin SDK (Node.js endpoints)
   - Used for: Storing fresh AI-generated recipes for admin review

### Composite Indexes (`firestore.indexes.json`)

Optimized indexes for common queries:

1. **AI Recipes - Published Status + Date**
   - Fields: `isPublished`, `createdAt`
   - Use case: Fetching published recipes ordered by date

2. **AI Recipes - Source + Date**
   - Fields: `source`, `createdAt`
   - Use case: Filtering by AI source with date ordering

3. **AI Recipes - Conversion Status + Date**
   - Fields: `status`, `createdAt`
   - Use case: Finding converted vs. pending recipes

4. **Cached Recipes - Country + Protein + Usage**
   - Fields: `input.country`, `input.protein`, `usageCount`
   - Use case: Finding popular recipe combinations

5. **Cached Recipes - Query Hash**
   - Fields: `queryHash`
   - Use case: Direct cache lookups by hash

6. **Cached Recipes - Creation Date**
   - Fields: `createdAt`
   - Use case: Cache maintenance and cleanup

## Important Notes

⚠️ **Security Model:**
- All writes to Firestore collections happen via Node.js Admin SDK endpoints
- Frontend cannot directly write to any collection
- AI recipes save through `/api/ai-chef/save-recipe` endpoint
- Recipe creation saves through `/api/recipes` endpoint

⚠️ **Index Deployment:**
- Deploying indexes may take 5-15 minutes
- Your app will continue to work during deployment
- Check Firebase Console to verify index status

⚠️ **Testing Rules:**
Before deploying to production, test in the Firebase Emulator:

```bash
firebase emulators:start
```

## Monitoring

Monitor your indexes and queries in Firebase Console:

1. Go to `Firestore Database` → `Indexes`
2. Verify all composite indexes show `Enabled` status
3. Check the `Indexes` tab for query performance

## Troubleshooting

### Index Creation Failed
- Check Firebase Console for error messages
- Ensure you have Blaze plan (required for composite indexes)
- Try deploying again - sometimes it's a temporary issue

### Rules Not Taking Effect
- Wait 2-3 minutes for rules to propagate
- Hard refresh browser and clear cache
- Check Firebase Console → Rules for errors

### Query Too Slow
- Verify index is enabled in Firebase Console
- Check query matches index fields
- Add missing fields to index if needed

## Rollback

If you need to rollback to previous rules:

```bash
# View deployment history
firebase history:list

# Deploy from specific version
firebase deploy --only firestore --force
```

## Additional Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Guide](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
