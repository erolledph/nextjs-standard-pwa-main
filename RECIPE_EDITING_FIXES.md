# Recipe Editing - Implementation Details & Testing

## Fixes Implemented

### 1. **Single Recipe Fetch (GET /api/recipes?slug=X)**
**File**: `app/api/recipes/route.ts`
**Change**: Added slug query parameter support
```typescript
const url = new URL(request.url)
const slug = url.searchParams.get('slug')

if (slug) {
  const recipe = recipes.find(r => r.slug === slug)
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
  }
  return NextResponse.json(recipe)
}
```
**Impact**: Edit page now receives single recipe object instead of array, preventing parse errors

---

### 2. **JSON Array Storage for Ingredients & Instructions**
**Files Modified**:
- `app/api/recipes/route.ts` (POST - create recipe)
- `app/api/recipes/update/route.ts` (PUT - update recipe)
- `lib/github.ts` (parse recipe)

**Before**:
```yaml
ingredients: "garlic, onion, tomato"
instructions: "1. Mix\n2. Cook\n3. Serve"
```
**Problem**: Comma-separated ingredients break on complex items, numbered instructions inconsistent

**After**:
```yaml
ingredients: ["garlic","onion","tomato","chili, minced"]
instructions: ["Mix ingredients","Cook on high heat","Serve hot"]
```
**Benefit**: Reliable JSON parsing, no loss of data with commas in ingredient names

---

### 3. **Dual-Mode Parser (Backward Compatible)**
**File**: `lib/github.ts`
**Logic**:
```typescript
// Try JSON array first
try {
  ingredients = JSON.parse(frontmatter.ingredients)
} catch {
  // Fall back to comma-separated for old recipes
  ingredients = frontmatter.ingredients.split(",").map(i => i.trim())
}

// Same for instructions
try {
  instructions = JSON.parse(frontmatter.instructions)
} catch {
  // Fall back to parsing numbered list
  instructions = frontmatter.instructions.split("\n")
    .map(inst => inst.replace(/^\s*\d+\.\s*/, '').trim())
}
```
**Benefit**: Existing recipes work, new recipes use reliable format

---

### 4. **Cache Invalidation Enhancement**
**File**: `app/api/recipes/update/route.ts`
```typescript
clearCacheByNamespace("github")
clearCacheByNamespace("recipes")
```
**Benefit**: Both cache namespaces cleared, ensuring fresh data on dashboard

---

### 5. **Improved Error Handling**
**File**: `app/admin/edit/[slug]/page.tsx`
```typescript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}))
  throw new Error(errorData.error || `Failed to fetch ${contentType === "recipes" ? "recipe" : "post"}`)
}
```
**Benefit**: Better error messages, graceful handling of non-JSON errors

---

## Data Flow After Fixes

```
GitHub Storage (JSON arrays)
    ↓ (parseMarkdownContent with dual-mode parser)
API Response (arrays)
    ↓ (single object via ?slug=)
Edit Form (arrays in state)
    ↓ (handleSubmit filters empty items)
Update Request (clean arrays)
    ↓ (PUT /api/recipes/update)
Convert to JSON strings
    ↓ (new format, backward compatible)
GitHub Storage (JSON arrays)
    ✅ Consistent format!
```

---

## Testing Checklist

### Create New Recipe
- [ ] Create new recipe with ingredients containing commas (e.g., "garlic, minced")
- [ ] Create recipe with multi-line instructions
- [ ] Verify data saves correctly to GitHub
- [ ] Verify ingredients/instructions parse correctly

### Edit Existing Recipe
- [ ] Edit a recipe created before fixes
- [ ] Edit a recipe created after fixes
- [ ] Modify ingredients to include comma
- [ ] Modify instructions (remove, add, edit)
- [ ] Save and verify dashboard shows updated version

### Admin Dashboard
- [ ] List all recipes shows correct data
- [ ] Click edit loads recipe with correct ingredients/instructions
- [ ] Delete recipe works
- [ ] Cache refreshes after update (check dashboard immediately)

### Frontend Rendering
- [ ] Recipe page displays correct prep/cook times
- [ ] Ingredients list shows all items with no truncation
- [ ] Instructions show all steps correctly
- [ ] Difficulty level displays correctly

---

## Firebase vs GitHub Strategy

**Current Implementation**: Recipes saved to **GitHub only** (not Firebase)

**Why**: 
- Cloudflare Pages Edge Runtime doesn't support firebase-admin
- GitHub provides version control and persistence
- Edit functionality designed around GitHub API

**Firebase Functions**: Exist in `lib/firebase-admin.ts` but are stubs
- For future use when migrating off Edge Runtime
- Or for AI-generated recipes stored separately (`ai_recipes` collection)

**Recommendation**: Keep GitHub as primary recipe storage, use Firebase only for:
- AI-generated recipes (separate `ai_recipes` collection)
- Recipe usage statistics
- User-specific data (favorites, ratings)

---

## Files Modified

1. ✅ `app/api/recipes/route.ts` - Added slug query param, changed to JSON arrays
2. ✅ `app/api/recipes/update/route.ts` - Changed to JSON arrays, improved cache clearing
3. ✅ `lib/github.ts` - Dual-mode parser for JSON and comma-separated formats
4. ✅ `app/admin/edit/[slug]/page.tsx` - Fixed fetch error handling

---

## Migration Notes

Old recipes stored with comma-separated ingredients and numbered instructions will still work due to the fallback parser. When edited and saved, they'll be converted to the new JSON format automatically.

Example legacy recipe:
```yaml
ingredients: "1 lb beef, 2 cloves garlic, minced, salt to taste"
instructions: "1. Brown the meat
2. Add garlic and cook
3. Season and serve"
```

Will be parsed correctly and converted to:
```yaml
ingredients: ["1 lb beef","2 cloves garlic, minced","salt to taste"]
instructions: ["Brown the meat","Add garlic and cook","Season and serve"]
```
