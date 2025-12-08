# AI Chef - Response Examples

## ✅ Successful API Response (200 OK)

When the user fills the form and submits, here's what Gemini returns:

```json
{
  "title": "Thai Garlic Chicken Stir-Fry",
  "servings": "4",
  "prepTime": "15 minutes",
  "cookTime": "20 minutes",
  "ingredients": [
    {
      "item": "Chicken",
      "amount": "2",
      "unit": "lbs"
    },
    {
      "item": "Garlic",
      "amount": "6",
      "unit": "cloves"
    },
    {
      "item": "Onion",
      "amount": "1",
      "unit": "medium"
    },
    {
      "item": "Tomato",
      "amount": "2",
      "unit": "medium"
    }
  ],
  "instructions": [
    "Slice chicken into bite-sized pieces",
    "Heat oil in a wok or large pan over high heat",
    "Add minced garlic and sliced onions, stir-fry for 1-2 minutes until fragrant",
    "Add chicken pieces and cook until golden brown, about 8-10 minutes",
    "Add diced tomatoes and stir well for 3-5 minutes",
    "Season with salt and pepper to taste",
    "Serve hot with steamed rice"
  ],
  "tips": [
    "Cut the chicken into uniform sizes for even cooking",
    "Don't overcrowd the pan; cook in batches if needed",
    "Use high heat for a quick stir-fry to keep ingredients fresh",
    "Add a splash of soy sauce for extra flavor if desired"
  ],
  "nutritionInfo": {
    "calories": 280,
    "protein": "35g",
    "carbs": "8g",
    "fat": "12g"
  }
}
```

## ❌ Error Responses

### 1. Invalid CSRF Token (403 Forbidden)
```json
{
  "error": "Invalid CSRF token"
}
```

### 2. Rate Limited (429 Too Many Requests)
```json
{
  "error": "Too many requests. Please try again later.",
  "remaining": 0
}
```

### 3. Invalid Input (400 Bad Request)
```json
{
  "error": "Invalid input",
  "details": {
    "description": ["Description must be at least 10 characters"],
    "taste": ["Select at least one taste profile"],
    "ingredients": ["Select at least 3 ingredients"]
  }
}
```

### 4. API Configuration Error (500 Internal Server Error)
```json
{
  "error": "AI service not properly configured"
}
```

### 5. Gemini API Quota Exceeded (429)
```json
{
  "error": "API quota exceeded. Please try again later."
}
```

### 6. AI Response Invalid JSON (500)
```json
{
  "error": "AI response was not valid. Please try again."
}
```

## 🔧 How the Form Works Now (Fixed)

### Form Validation Flow:
1. **Description** - Required, 10-500 characters
   - ✅ Validates as you type
   - ❌ Button disabled if < 10 chars or > 500 chars

2. **Cuisine/Country** - Required dropdown
   - ✅ Must select one from predefined list
   - ❌ Button disabled if empty

3. **Protein** - Required dropdown
   - ✅ Must select one from predefined list
   - ❌ Button disabled if empty

4. **Taste Profiles** - Required, 1-3 selections
   - ✅ Click buttons to toggle selection
   - ✅ Selected items highlight in orange
   - ❌ Button disabled if 0 or > 3 selected

5. **Ingredients** - Required, 3-20 selections
   - ✅ Click buttons to toggle selection
   - ✅ Selected counter shows "Selected: X/20"
   - ❌ Button disabled if < 3 or > 20 selected

### Submit Button States:
- **Disabled (Gray)** - When form has validation errors
- **Enabled (Orange)** - When all fields are valid
- **Loading (Spinner)** - While AI is generating
- **Disabled (After)** - While recipe is displayed

## 📊 AI Processing Steps

When you click "Generate Recipe":

1. **Generates CSRF Token** (browser-side)
2. **Validates Form** (client-side with Zod)
3. **Sends POST Request** with all data
4. **API Checks Rate Limit** (per IP address)
5. **API Validates CSRF Token** (server-side)
6. **API Checks Cache** (return if exists)
7. **Calls Gemini 2.5 Flash-Lite** (if not cached)
8. **Validates Response** with Zod schema
9. **Caches Result** for 24 hours
10. **Returns JSON** to frontend
11. **Displays Recipe** beautifully

## ⏱️ Expected Response Times

- **All fields valid & submitted:** Instant feedback (loading state shows)
- **Cached recipe:** ~100-200ms response
- **New recipe (API call):** 2-4 seconds (Gemini processing)
- **Display recipe:** Instant (static rendering)

## 🔐 Security Features

- ✅ CSRF token required on every request
- ✅ Rate limiting: 10 requests/hour per IP
- ✅ Input validation: Zod schemas
- ✅ Output validation: Strict schema enforcement
- ✅ Error messages: User-friendly (no stack traces)
- ✅ Edge runtime: Compatible with Cloudflare

---

**The form is now fully functional!**
Fill all fields and click "Generate Recipe" to see the AI response.
