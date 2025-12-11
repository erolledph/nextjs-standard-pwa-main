# AI Chef - Complete Flow & Logic Documentation

## High-Level Architecture
```
User Form → Search Existing Recipes → Display Matches → Generate Fresh AI → Save to Firestore
```

---

## STAGE 1: User Input Form
**File:** `components/ai-chef/AIChefPageNew.tsx`

User fills out form with:
- **Description** - What they want to cook (e.g., "quick dinner for family")
- **Country** - Cuisine preference (e.g., "Thai", "Italian", "Indian")
- **Protein** - Main ingredient (e.g., "Chicken", "Fish", "Tofu")
- **Taste Profiles** - Multiple selections (e.g., ["Spicy", "Savory", "Creamy"])
- **Ingredients** - Additional requirements (e.g., ["Garlic", "Ginger", "Coconut"])

**Validation:** Uses Zod schema (`AIChefInputSchema`) to ensure all fields are valid

---

## STAGE 2: Search for Existing Recipes
**File:** `app/api/ai-chef/search/route.ts`

### Step 1: Generate Query Hash
```typescript
queryHash = generateQueryHash(input)
```
- Creates a unique hash of the search query
- Used to cache results and recognize identical requests
- Example: `hash_xyz123` for "Thai Chicken with Spicy Garlic"

### Step 2: Check Exact Cache Match (ZERO COST)
```
Is queryHash in CACHED_RECIPES_DB?
├─ YES → Return cached recipe immediately (ZERO API calls)
└─ NO → Continue to Step 3
```
**Benefit:** If user searches same thing twice, get instant result

### Step 3: Search Similar Cached Recipes
```typescript
similarRecipes = findBestMatches(input, cachedRecipes, 0.65)
```
- Fuzzy matches against all previously generated AI recipes
- Uses similarity score (0-1): need 0.65+ to show
- Returns top 3 similar recipes
- **Cost:** Zero (all in-memory, no API calls)

### Step 4: Search Recipe Posts from GitHub
```typescript
recipePosts = await loadRecipePosts()
  .filter(similarity > 0.3)  // Only reasonably similar
  .sort(by similarity)        // Best matches first
  .take(5)                    // Top 5 matches
```
- Loads all recipe posts from GitHub repository
- Filters by:
  - Cuisine match
  - Ingredient overlap
  - Protein availability
  - Description similarity
- Returns ranked list of existing published recipes
- **Cost:** One GitHub API call (cached in edge runtime)

### Response Structure
```json
{
  "queryHash": "hash_xyz123",
  "recipePosts": [...],        // Existing published recipes
  "cachedResults": [...],       // Previously generated AI recipes
  "shouldGenerateNew": false,   // Do we need fresh AI?
  "source": "search"
}
```

---

## STAGE 3: Display Results
**File:** `components/ai-chef/AIChefPageNew.tsx`

### Tab 1: Suggestions (Existing Recipes)
- Shows `recipePosts` + `cachedResults`
- User can view and save these immediately
- **No AI generation needed**

### Tab 2: Generated (Fresh AI Recipe)
- Generated simultaneously with search results
- Always shows fresh AI recipe using Gemini
- Allows user to choose between suggested or generated

---

## STAGE 4: Generate Fresh AI Recipe (PARALLEL)
**File:** `components/ai-chef/AIChefPageNew.tsx` (client-side)

**Trigger:** Happens immediately after search, regardless of matches

### Model: Gemini 2.5 Flash Lite
```typescript
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite"  // Fast, cheap, accurate for recipes
})
```

### Prompt Engineering
```
System: "You are a professional chef specializing in {country} cuisine"

User: "Generate a delicious authentic {country} recipe featuring {protein}
       with description: {description}
       Taste profile: {taste.join(", ")}
       Key ingredients: {ingredients.slice(0, 5).join(", ")}"

Response Format: STRICT JSON only
{
  "title": "Creative appetizing name",
  "description": "1-2 sentence description",
  "servings": 4,
  "prepTime": "15 minutes",
  "cookTime": "45 minutes",
  "totalTime": "1 hour",
  "difficulty": "Medium",
  "ingredients": [
    {"item": "name", "amount": "2", "unit": "cups"}
  ],
  "instructions": [
    "Step 1", "Step 2", ...
  ],
  "nutritionPer100g": {
    "calories": 250,
    "protein": 20,
    "carbs": 30,
    "fat": 10
  },
  "cuisine": "{country}"
}
```

### Response Processing
```typescript
text = generativeResponse.response.text()
cleanText = text.replace(/```json/g, "").trim()  // Remove markdown
freshResponse = JSON.parse(cleanText)
```

### Data Enrichment
If Gemini returns incomplete data:
```typescript
enrichedResponse = {
  title: freshResponse.title || generateTitle(protein, country, taste),
  description: freshResponse.description || "",
  servings: freshResponse.servings || 4,
  prepTime: freshResponse.prepTime || "15 minutes",
  cookTime: freshResponse.cookTime || "30 minutes",
  difficulty: freshResponse.difficulty || "Medium",
  ingredients: normalizeIngredients(freshResponse.ingredients),
  instructions: normalizeInstructions(freshResponse.instructions),
}
```

---

## STAGE 5: Display Recipe & Save to Firebase
**File:** `components/ai-chef/AIChefPageNew.tsx` (client-side)

### User Views Recipe
User can see:
- Complete recipe details
- Ingredients with amounts
- Step-by-step instructions
- Nutrition info
- Cuisine type
- Difficulty level

### Save to Firestore (Automatic)
When user clicks "View Recipe" on fresh AI:

```typescript
if (isFreshAI && formData) {
  // 1. Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyB2grFk9IQj7rP-gMrYVNuLRHpdQiEoVAo",
    projectId: "chef-ai-nunoy",
  }
  
  // 2. Create Firestore reference
  const db = getFirestore(app)
  const recipesCollection = collection(db, "ai_recipes")
  
  // 3. Build document
  const aiRecipeData = {
    id: `ai-recipe-${Date.now()}-${random}`,
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    totalTime: recipe.totalTime,
    difficulty: recipe.difficulty,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    nutritionInfo: recipe.nutritionInfo,
    cuisine: formData.country,
    userInput: {          // Store original search params
      description: formData.description,
      country: formData.country,
      protein: formData.protein,
      taste: formData.taste,
      ingredients: formData.ingredients,
    },
    createdAt: Timestamp.now(),  // Firestore server timestamp
    isPublished: false,           // Not yet in blog
    source: "ai-generated",       // Track source
  }
  
  // 4. Save to Firestore
  await addDoc(recipesCollection, aiRecipeData)
  console.log("✅ Recipe saved to Firebase:", recipeId)
}
```

**Database Structure:**
```
Firestore
└── ai_recipes (collection)
    ├── {docId1} (document)
    │   ├── id: "ai-recipe-1701234567890-abc123"
    │   ├── title: "Spiced Saffron Chicken Biryani"
    │   ├── description: "Aromatic rice with tender chicken..."
    │   ├── ingredients: [...]
    │   ├── instructions: [...]
    │   ├── createdAt: Timestamp(2024-12-09...)
    │   ├── isPublished: false
    │   └── userInput: {...}
    │
    └── {docId2} (document)
        └── ...
```

---

## STAGE 6: Admin Dashboard - Fetch & Convert
**File:** `components/admin/AIRecipesTab.tsx`

### Fetch AI Recipes
```typescript
async function fetchAIRecipes() {
  const firebaseConfig = {
    apiKey: "AIzaSyB2grFk9IQj7rP-gMrYVNuLRHpdQiEoVAo",
    projectId: "chef-ai-nunoy",
  }
  
  const db = getFirestore(app)
  
  // Query: Get all unpublished recipes, newest first
  const q = query(
    collection(db, "ai_recipes"),
    orderBy("createdAt", "desc")
  )
  
  const snapshot = await getDocs(q)
  const recipes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }))
  
  return recipes
}
```

### Display in Admin Dashboard
Shows table with:
- Recipe title
- Country/cuisine
- Prep time
- Cook time
- Servings
- Created date
- Actions: "Convert to Post" + "Delete"

### Convert to Recipe Post
When admin clicks "Convert to Post":

```typescript
function handleConvertToRecipePost(recipe) {
  // 1. Format ingredients for blog format
  const ingredients = recipe.ingredients
    .map(ing => `${ing.item} - ${ing.amount} ${ing.unit}`)
    .join("\n")
  
  // 2. Prepare data for recipe creation page
  const recipeData = {
    title: recipe.title,
    content: recipe.instructions.join("\n\n"),
    excerpt: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    ingredients: ingredients,
    tags: [recipe.cuisine, recipe.userInput.protein, ...recipe.userInput.taste],
    nutrition: JSON.stringify(recipe.nutritionInfo),
    aiRecipeId: recipe.id,  // Track original AI recipe
  }
  
  // 3. Navigate to create page with pre-filled data
  router.push(`/admin/create?ai=${encodeURIComponent(JSON.stringify(recipeData))}`)
}
```

### Delete AI Recipe
```typescript
async function deleteAIRecipe(recipeId) {
  const db = getFirestore(app)
  await deleteDoc(doc(db, "ai_recipes", recipeId))
  // Update UI
  setAIRecipes(prev => prev.filter(r => r.id !== recipeId))
}
```

---

## Cost Optimization Strategy

### Zero Cost Scenarios
1. **Exact cache hit** - Return cached recipe (0 API calls)
2. **Similar recipe found** - Return from existing AI cache (0 API calls)
3. **Recipe post match** - Return from GitHub database (1 GitHub API call, cached)

### Minimal Cost Scenarios
1. **Fresh AI generation** - 1 Gemini API call per unique request
   - Uses cheapest model: `gemini-2.5-flash-lite`
   - Fixed system prompt (no optimization needed)
   - JSON format enforcement (no token waste)

### Storage Cost (Negligible)
- Firestore: Only AI recipes not yet published (~1KB per recipe)
- Auto-delete old drafts to manage costs

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER FORM (Stage 1)                                         │
│ Description, Country, Protein, Taste, Ingredients          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ SEARCH API (Stage 2) - /api/ai-chef/search                 │
│ 1. Generate queryHash                                       │
│ 2. Check exact cache hit (ZERO COST)                        │
│ 3. Find similar cached recipes (ZERO COST)                  │
│ 4. Search GitHub recipe posts (1 API call)                  │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        ↓                 ↓
┌──────────────────┐  ┌──────────────────────────┐
│ Tab 1:           │  │ Tab 2: Generated         │
│ Suggestions      │  │ Fresh AI Recipe          │
│ (Existing)       │  │ (Parallel Generation)    │
│ - Recipe posts   │  │ - Gemini 2.5 Flash Lite │
│ - Cached AI      │  │ - JSON format            │
└──────────────────┘  └─────────┬────────────────┘
        │                        │
        └────────────┬───────────┘
                     ↓
        ┌────────────────────────────┐
        │ DISPLAY RECIPE (Stage 3)   │
        │ User selects recipe        │
        │ Views full details         │
        └────────────┬───────────────┘
                     │
                     ↓
        ┌────────────────────────────────┐
        │ SAVE TO FIRESTORE (Stage 4)    │
        │ Client-side addDoc()           │
        │ ai_recipes collection          │
        └────────────┬───────────────────┘
                     │
                     ↓
        ┌────────────────────────────────┐
        │ ADMIN DASHBOARD (Stage 5)      │
        │ View saved AI recipes          │
        │ Convert to blog post           │
        │ or Delete                      │
        └────────────────────────────────┘
```

---

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Form | React Hook Form + Zod | Input validation |
| Search API | Edge Runtime | Fast, zero-cold-start |
| AI Generation | Gemini 2.5 Flash Lite | Recipe generation |
| Caching | In-memory object | Query hash matching |
| Database | Firestore (Client SDK) | Store AI recipes |
| Admin Panel | React + Firestore | Manage recipes |
| Deployment | Cloudflare Pages | Edge runtime only |

---

## Security Notes

⚠️ **Public Firestore Rules Required:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ai_recipes/{document=**} {
      allow create: if true;  // Users can save AI recipes
      allow read: if true;    // Admin can view all recipes
      allow delete: if request.auth.uid != null;  // Only authenticated users
      allow update: if request.auth.uid != null;
    }
  }
}
```

---

## Summary

Your AI Chef system uses a **smart caching strategy** to minimize API costs:

1. **Search first** → Check existing recipes (0 cost)
2. **Offer alternatives** → Show similar recipes (0 cost)
3. **Generate fresh** → Only if user wants new recipe (1 Gemini call)
4. **Save to Firestore** → Store AI recipes for admin access
5. **Convert to posts** → Admin converts best recipes to blog posts

**Result:** Most users see existing recipes for free. Only genuinely unique requests trigger Gemini API calls. Perfect for zero-billing goal! 🎯
