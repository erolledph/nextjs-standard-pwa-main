# Firebase Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment Setup

### Firebase Project Configuration

- [ ] Create Firebase Project at [Firebase Console](https://console.firebase.google.com)
- [ ] Enable Firestore Database
- [ ] Enable Authentication (optional, but recommended)
- [ ] Note your Project ID from Settings
- [ ] Generate Service Account key from Project Settings → Service Accounts

### Local Environment Setup

- [ ] Install Node.js (v16+) and npm/yarn
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Authenticate Firebase CLI: `firebase login`
- [ ] Create `.env.local` with Firebase credentials:
  ```env
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
  ```

### Configuration Files

- [ ] Update `.firebaserc` with correct Project ID:
  ```json
  {
    "projects": {
      "default": "your-actual-firebase-project-id"
    }
  }
  ```
- [ ] Verify `firebase.rules` exists and contains all collection rules
- [ ] Verify `firestore.indexes.json` exists with all 6 composite indexes
- [ ] Verify `firestore.json` exists with correct path references

## Pre-Deployment Testing

### Local Development

- [ ] Run `npm run dev` and verify no build errors
- [ ] Test AI Chef page: Generate a recipe
- [ ] Test Firebase save: Click "View Full Recipe"
- [ ] Test Admin Dashboard: Navigate to "AI Generated" tab
- [ ] Test recipe creation: Click "Convert to Recipe Post"
- [ ] Verify form pre-fills with AI recipe data

### Firebase Emulator (Optional but Recommended)

- [ ] Install emulator: `firebase init emulators`
- [ ] Start emulator: `firebase emulators:start`
- [ ] Test against emulator before production deployment

## Deployment Execution

### Choose Deployment Method

#### Option A: Interactive Script (Recommended)

**Windows (PowerShell):**
- [ ] Open PowerShell in project root
- [ ] Run: `.\deploy-firebase.ps1`
- [ ] Select option "1" (Deploy everything)
- [ ] Confirm authentication prompt

**Linux/Mac (Bash):**
- [ ] Open Terminal in project root
- [ ] Run: `./deploy-firebase.sh`
- [ ] Select option "1" (Deploy everything)
- [ ] Wait for completion

#### Option B: Manual Deployment

- [ ] Open Terminal/PowerShell in project root
- [ ] Run: `firebase deploy --only firestore`
- [ ] Wait for both rules and indexes to deploy

#### Option C: Selective Deployment

If you only need to deploy rules or indexes:

- [ ] Rules only: `firebase deploy --only firestore:rules`
- [ ] Indexes only: `firebase deploy --only firestore:indexes`

## Post-Deployment Verification

### Firebase Console Checks

1. **Rules Verification:**
   - [ ] Go to Firebase Console → Firestore → Rules
   - [ ] Verify all rules appear without errors
   - [ ] Check rule syntax is valid

2. **Index Verification:**
   - [ ] Go to Firebase Console → Firestore → Indexes
   - [ ] Verify all 6 indexes listed:
     - [ ] `ai_recipes - isPublished + createdAt`
     - [ ] `ai_recipes - source + createdAt`
     - [ ] `ai_recipes - status + createdAt`
     - [ ] `cached_recipes - country + protein + usage`
     - [ ] `cached_recipes - queryHash`
     - [ ] `cached_recipes - createdAt`
   - [ ] All indexes show "Enabled" status (may take 5-15 min)
   - [ ] No indexes in "Creating" or "Failed" state

3. **Firestore Structure:**
   - [ ] Go to Firestore → Data
   - [ ] Verify these collections exist (or will be created by app):
     - [ ] `ai_recipes`
     - [ ] `cached_recipes`

### Application Testing

After 5-15 minutes (for indexes to fully activate):

1. **Clear Browser Cache**
   - [ ] Hard refresh your app: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - [ ] Clear cookies if needed

2. **Test Complete Workflow**
   - [ ] Generate new AI recipe on AI Chef page
   - [ ] Click "View Full Recipe" (should save to Firebase)
   - [ ] Check browser console for errors (F12)
   - [ ] Navigate to Admin Dashboard
   - [ ] Go to "AI Generated" tab
   - [ ] Verify newly created recipe appears in table
   - [ ] Click "Convert to Recipe Post"
   - [ ] Verify form pre-fills with recipe data:
     - [ ] Title filled
     - [ ] Prep time filled
     - [ ] Cook time filled
     - [ ] Servings filled
     - [ ] Ingredients filled
     - [ ] Difficulty selected
     - [ ] Content filled
   - [ ] Update image URL
   - [ ] Make any edits needed
   - [ ] Click "Create Recipe"
   - [ ] Verify success toast notification
   - [ ] Verify redirect to admin dashboard

3. **Verify Data in Firebase**
   - [ ] Go to Firebase Console → Firestore → Data
   - [ ] Find the `ai_recipes` collection
   - [ ] Verify latest recipe shows:
     - [ ] `status: "converted"`
     - [ ] `convertedAt: [timestamp]`
     - [ ] `convertedTo: {slug, author, ...}`

## Production Deployment Checklist

### Environment Variables

- [ ] Production `.env.local` has correct credentials
- [ ] Firebase project ID matches production project
- [ ] Private key has correct format (escaped newlines)
- [ ] Client email matches production service account

### Performance Monitoring

- [ ] Set up Firebase billing alerts
- [ ] Monitor Firestore read/write quotas
- [ ] Check index creation is complete
- [ ] Monitor query performance in first 24 hours

### Security Review

- [ ] All rules restrict default to DENY
- [ ] No overly permissive rules in place
- [ ] Server-side validation on all API endpoints
- [ ] Rate limiting configured on sensitive endpoints
- [ ] No credentials exposed in client code

### Backup & Recovery

- [ ] Enable automatic Firestore backups
- [ ] Document backup retention policy
- [ ] Test restoration procedure
- [ ] Document rollback process

## Rollback Procedure (If Issues Occur)

If deployment causes issues:

1. **Identify Problem**
   - [ ] Check Firebase Console for error messages
   - [ ] Review recent deployments: `firebase history:list`
   - [ ] Check application logs

2. **Rollback Rules**
   - [ ] Edit `firebase.rules` back to previous version
   - [ ] Deploy: `firebase deploy --only firestore:rules`
   - [ ] Verify rules in Console

3. **Rollback Indexes**
   - [ ] Edit `firestore.indexes.json` back to previous version
   - [ ] Deploy: `firebase deploy --only firestore:indexes`
   - [ ] Monitor index recreation

4. **Full Rollback**
   - [ ] Use `firebase history:list` to find previous version
   - [ ] Note timestamp of stable version
   - [ ] Contact Firebase support for recovery assistance

## Post-Deployment Maintenance

### Weekly

- [ ] Monitor Firestore costs
- [ ] Check for slow queries
- [ ] Verify all indexes enabled

### Monthly

- [ ] Review security rules for updates
- [ ] Audit index usage patterns
- [ ] Test backup restoration

### Quarterly

- [ ] Review and optimize indexes
- [ ] Audit security rules effectiveness
- [ ] Plan for scaling needs

## Support & Documentation

### Quick Reference Files

Located in project root:

- **`FIREBASE_DEPLOYMENT_GUIDE.md`** - Detailed deployment instructions
- **`FIREBASE_CONFIG_REFERENCE.md`** - Configuration details & schemas
- **`FIREBASE_DEPLOYMENT_SUMMARY.md`** - Quick overview
- **`firebase.rules`** - Security rules
- **`firestore.indexes.json`** - Index definitions
- **`.firebaserc`** - Project reference

### Helpful Commands

```bash
# Check current project
firebase projects:list

# View deployment history
firebase history:list

# Monitor firestore usage
firebase ext:info

# Test rules (with emulator)
firebase emulators:start

# Deploy specific component
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Get help
firebase help deploy
```

## Sign-Off

- [ ] I have completed all pre-deployment checks
- [ ] I have tested the workflow end-to-end
- [ ] I understand the security model
- [ ] I know how to rollback if needed
- [ ] I have documented any customizations

**Deployed By:** ________________  
**Date:** ________________  
**Project ID:** ________________  
**Notes:** 

---

**Ready to Deploy?** ✅

If all checkboxes are marked, you're ready to deploy to production!

Contact: [Your Contact Info]  
Last Updated: December 8, 2025
