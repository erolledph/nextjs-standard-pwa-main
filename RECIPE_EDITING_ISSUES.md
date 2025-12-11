# Recipe Editing Issues - Analysis & Fixes

## Issues Identified

### 1. **Missing Single Recipe Fetch Endpoint**
**Location**: `app/api/recipes/route.ts` GET handler
**Problem**: The GET endpoint only returns ALL recipes, not a single recipe by slug
**Impact**: Edit page tries to fetch `/api/recipes?slug=${slug}` but it returns entire array, causing parse errors
**Fix**: Add slug query parameter handling to return single recipe

### 2. **Instructions Parsing Mismatch**
**Location**: `lib/github.ts` lines 225-230 and `app/api/recipes/update/route.ts` lines 109-111
**Problem**: 
- Update endpoint sends instructions as indented numbered list in frontmatter
- Parser strips numbers but expects newlines separating items
- When instructions contain actual newlines, splitting breaks instruction boundaries

**Impact**: Instructions get corrupted when editing and re-saving

### 3. **Ingredients Array Handling**
**Location**: `lib/github.ts` lines 217-222 and `app/api/recipes/update/route.ts` lines 100-101
**Problem**: 
- Ingredients stored as comma-separated string in frontmatter
- Parser splits by comma, but ingredients might contain commas (e.g., "garlic, minced")
- No proper array handling between client/server

**Impact**: Complex ingredients descriptions get truncated at first comma

### 4. **Firebase Integration Confusion**
**Location**: `lib/firebase-admin.ts` and `app/api/recipes/route.ts`
**Problem**:
- Firebase functions exist but are not used for recipe updates
- Recipes only save to GitHub, not to Firebase
- Confusing error messages about Firebase not being available

**Impact**: Admin expects recipes in Firebase but they're only in GitHub

### 5. **Edit Form Data Type Mismatch**
**Location**: `app/admin/edit/[slug]/page.tsx` lines 69-82
**Problem**:
- Form stores ingredients/instructions as arrays internally
- But sends them to API correctly
- However, when data comes back, parsing might not reconstruct arrays properly
- ingredients/instructions might be strings instead of arrays

**Impact**: Form displays incorrectly on page load for recipes

### 6. **Cache Not Cleared After Updates**
**Location**: `app/api/recipes/update/route.ts` line 142
**Problem**:
- Cache cleared only for "github" namespace
- But recipes endpoint might use different cache key
- Edit page might show stale data

**Impact**: Updates don't reflect immediately on dashboard

## Root Cause Analysis

The core issue is **data structure transformation between storage and API**:
1. **Storage Format** (GitHub markdown): String-based frontmatter
2. **API Response**: Parsed arrays for ingredients/instructions
3. **Edit Form**: Internal state uses arrays
4. **Update Request**: Sends arrays
5. **Update Storage**: Converts arrays back to strings with inconsistent formatting

## Data Flow Issues

```
GitHub Storage (strings)
    ↓ (parseMarkdownContent)
API Response (arrays)
    ↓ (setFormData)
Form State (arrays)
    ↓ (handleSubmit)
Update Request (arrays)
    ↓ (PUT /api/recipes/update)
Convert to String with indentation
    ↓ (encoded and sent to GitHub)
GitHub Storage (strings with different format)
    ↓ (next parseMarkdownContent)
🔴 PARSE ERROR - format mismatch!
```

## Solutions Implemented

1. ✅ Add slug parameter to GET /api/recipes
2. ✅ Fix instructions parsing to handle indentation consistently
3. ✅ Use JSON array format for ingredients/instructions in frontmatter
4. ✅ Ensure type consistency throughout data flow
5. ✅ Add proper cache invalidation
6. ✅ Document Firebase vs GitHub strategy
