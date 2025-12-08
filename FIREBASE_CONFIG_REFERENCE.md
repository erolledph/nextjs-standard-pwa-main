# Firebase Configuration Reference

Complete Firebase configuration for the AI Recipe application with Firestore, security rules, and indexes.

## Configuration Files

### 1. `.firebaserc`
Project configuration for Firebase CLI.

**Location:** `.firebaserc`

**Purpose:** Specifies which Firebase project to use for deployments

**To Update:**
```json
{
  "projects": {
    "default": "your-actual-firebase-project-id"
  }
}
```

Replace `your-actual-firebase-project-id` with your Firebase project ID from [Firebase Console](https://console.firebase.google.com).

### 2. `firestore.json`
Firestore configuration mapping rules and indexes.

**Location:** `firestore.json`

**Purpose:** Tells Firebase CLI where to find Firestore rules and indexes

**Contents:**
```json
{
  "firestore": {
    "rules": "firebase.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 3. `firebase.rules`
Firestore security rules controlling data access.

**Location:** `firebase.rules`

**Collections Protected:**

| Collection | Purpose | Read Access | Write Access |
|------------|---------|-------------|--------------|
| `cached_recipes` | AI response cache | Public | Admin SDK only |
| `recipes` | Recipe post cache | Authenticated | Admin SDK only |
| `ai_recipes` | Generated recipes | Published=public, Unpublished=auth | Admin SDK only |

**Security Model:**
- Default: Deny all access
- All writes via Node.js Admin SDK endpoints
- Frontend reads only (filtered by published status)

### 4. `firestore.indexes.json`
Composite indexes for query optimization.

**Location:** `firestore.indexes.json`

**Indexes Created:**

1. **AI Recipes - Published + Date** (for listing published recipes)
   - Fields: `isPublished` (ASC), `createdAt` (DESC)

2. **AI Recipes - Source + Date** (for filtering by source)
   - Fields: `source` (ASC), `createdAt` (DESC)

3. **AI Recipes - Status + Date** (for conversion tracking)
   - Fields: `status` (ASC), `createdAt` (DESC)

4. **Cached Recipes - Country + Protein + Usage** (for similar recipe discovery)
   - Fields: `input.country` (ASC), `input.protein` (ASC), `usageCount` (DESC)

5. **Cached Recipes - Query Hash** (for direct lookups)
   - Fields: `queryHash` (ASC)

6. **Cached Recipes - Date** (for cache management)
   - Fields: `createdAt` (DESC)

## Environment Configuration

### Firebase Project Setup

1. Create Firebase Project in [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (if not already enabled)
4. Get your Project ID

### Environment Variables

Required environment variables (in `.env.local`):

```env
# Firebase Admin SDK credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com
```

To get these credentials:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Copy the JSON credentials
4. Add to `.env.local`

## Deployment Commands

### Deploy Everything
```bash
firebase deploy --only firestore
```

### Deploy Only Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Indexes
```bash
firebase deploy --only firestore:indexes
```

### List Current Deployments
```bash
firebase history:list
```

## Collection Schemas

### `ai_recipes` Collection

```javascript
{
  // Basic info
  title: string,
  servings: string,
  prepTime: string,
  cookTime: string,
  
  // Content
  ingredients: string[],
  instructions: string[],
  tips: string[],
  nutritionInfo: object | null,
  
  // User input metadata
  userInput: {
    description: string,
    country: string,
    protein: string,
    taste: string[],
    ingredients: string[]
  },
  
  // Status tracking
  createdAt: timestamp,
  updatedAt: timestamp,
  source: "ai-chef",
  isPublished: boolean,
  status: "pending" | "converted",
  
  // Conversion tracking
  convertedAt: timestamp | null,
  convertedTo: {
    slug: string,
    author: string,
    image?: string,
    difficulty?: string
  } | null,
  
  // Analytics
  views: number,
  likes: number,
  comments: number
}
```

### `cached_recipes` Collection

```javascript
{
  queryHash: string,
  
  input: {
    description: string,
    country: string,
    protein: string,
    taste: string[],
    ingredients: string[]
  },
  
  recipe: {
    title: string,
    servings: string,
    prepTime: string,
    cookTime: string,
    ingredients: string[],
    instructions: string[],
    tips: string[],
    nutritionInfo: object | null
  },
  
  queryEmbedding: number[] | null,
  
  createdAt: timestamp,
  updatedAt: timestamp,
  usageCount: number,
  lastUsedAt: timestamp
}
```

## Security Best Practices

✅ **Do:**
- Use Admin SDK for all writes
- Validate data on backend before storing
- Implement rate limiting on API endpoints
- Keep Firestore rules restrictive by default
- Audit accessed collections regularly

❌ **Don't:**
- Allow frontend writes directly to Firestore
- Store sensitive data in public collections
- Use overly permissive rules
- Expose Firebase configuration credentials
- Mix authenticated and public data in same documents

## Monitoring & Maintenance

### Check Index Status
1. Firebase Console → Firestore → Indexes
2. Verify all indexes show "Enabled" status
3. Monitor index creation progress

### Monitor Costs
1. Firebase Console → Billing
2. Set up billing alerts
3. Review read/write quotas

### Query Performance
1. Firebase Console → Firestore → Usage
2. Check slow queries
3. Optimize with additional indexes if needed

## Troubleshooting

### Can't Deploy
- Verify Firebase CLI is authenticated: `firebase login`
- Check `.firebaserc` has correct project ID
- Ensure you have permission on Firebase project

### Indexes Not Working
- Wait for index to be created (5-15 minutes)
- Refresh Firebase Console
- Check for syntax errors in `firestore.indexes.json`

### Rules Not Restricting Access
- Wait for rules to propagate (2-3 minutes)
- Check browser cache and clear it
- Verify rule syntax in Firebase Console

### High Costs
- Review read/write patterns
- Implement caching on backend
- Consider splitting reads into smaller queries
- Use bulk operations for multiple writes

## Additional Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Indexes Guide](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [Firebase CLI Docs](https://firebase.google.com/docs/cli)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)
