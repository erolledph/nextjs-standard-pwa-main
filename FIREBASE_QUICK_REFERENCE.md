# Firebase Quick Reference

## Fast Deployment Commands

```bash
# Deploy everything
firebase deploy --only firestore

# Deploy just rules
firebase deploy --only firestore:rules

# Deploy just indexes
firebase deploy --only firestore:indexes

# View project info
firebase projects:list

# Check current project
firebase use
```

## File Locations

- **Security Rules:** `firestore.rules`
- **Indexes:** `firestore.indexes.json`
- **Project Config:** `.firebaserc`
- **Firebase Config:** `firebase.json`

## Collections Quick View

| Collection | Access | Writers |
|-----------|--------|---------|
| `ai_recipes` | Auth users | Admin SDK only |
| `cached_recipes` | Public | Admin SDK only |
| `recipes` | Auth users | Admin SDK only |

## Environment Variables Needed

```env
FIREBASE_PROJECT_ID=chef-ai-nunoy
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@chef-ai-nunoy.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

## Node.js Endpoints

- **Save Recipe:** `POST /api/ai-chef/save-recipe` (Runtime: Node.js)
- **Create Recipe:** `POST /api/recipes` (Runtime: Node.js)
- **Admin AI Recipes:** `GET /api/admin/ai-recipes` (Runtime: Node.js)

## Deployment Checklist

- [ ] Rules syntax validated
- [ ] Indexes structure correct
- [ ] Environment variables set
- [ ] Firebase CLI authenticated
- [ ] Project selected (`chef-ai-nunoy`)
- [ ] Run `firebase deploy --only firestore`
- [ ] Verify in Firebase Console

## Common Errors & Fixes

### Error: "this index is not necessary"
**Solution:** Remove single-field indexes (Firestore handles these automatically)

### Error: "Invalid variable name"
**Solution:** Check rule syntax - remove unsupported functions like `.where()` or `.limit()`

### Error: "Index deployment timeout"
**Solution:** Wait 5-15 minutes, then check Firebase Console for status

## Success Indicators

✅ Rules compile without errors  
✅ Indexes deployed with green checkmarks  
✅ No pending deployments  
✅ Project Console accessible  

## One-Command Deploy

```bash
firebase deploy --only firestore && echo "✅ Deployment complete!"
```

## Useful Links

- [Firebase Console](https://console.firebase.google.com/project/chef-ai-nunoy)
- [Firestore Database](https://console.firebase.google.com/project/chef-ai-nunoy/firestore)
- [Rules Editor](https://console.firebase.google.com/project/chef-ai-nunoy/firestore/rules)
- [Indexes](https://console.firebase.google.com/project/chef-ai-nunoy/firestore/indexes)
