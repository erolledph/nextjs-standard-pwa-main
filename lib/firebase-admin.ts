/**
 * Firebase Admin SDK for server-side operations
 * Used for caching AI responses and searching saved recipes
 */

import * as admin from "firebase-admin"

// Initialize Firebase Admin SDK only once
let db: admin.firestore.Firestore | null = null

export function initializeFirebase() {
  if (db) return db

  const projectId = process.env.FIREBASE_PROJECT_ID
  let privateKey = process.env.FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

  if (!projectId || !privateKey || !clientEmail) {
    console.error("Firebase config check:")
    console.error("  FIREBASE_PROJECT_ID:", projectId ? "✓" : "✗")
    console.error("  FIREBASE_PRIVATE_KEY:", privateKey ? "✓" : "✗")
    console.error("  FIREBASE_CLIENT_EMAIL:", clientEmail ? "✓" : "✗")
    throw new Error("Missing Firebase configuration in environment variables")
  }

  // Handle both quoted and unquoted private keys
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1)
  }
  
  // Ensure newlines are properly escaped
  privateKey = privateKey.replace(/\\n/g, "\n")

  try {
    // Check if Firebase app is already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      })
    }

    db = admin.firestore()
    console.log("✅ Firebase Admin SDK initialized")
    return db
  } catch (error) {
    console.error("❌ Firebase initialization error:", error)
    throw error
  }
}

export function getFirestore(): admin.firestore.Firestore {
  if (!db) {
    initializeFirebase()
  }
  return db!
}

/**
 * Save AI-generated recipe to Firebase cache
 * Used to avoid duplicate API calls for similar queries
 */
export async function saveRecipeToCache(
  queryHash: string,
  input: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  },
  recipe: any,
  queryEmbedding?: number[]
) {
  try {
    const db = getFirestore()
    const timestamp = new Date()

    await db.collection("cached_recipes").doc(queryHash).set(
      {
        queryHash,
        input,
        recipe,
        queryEmbedding: queryEmbedding || null, // For future similarity search
        createdAt: admin.firestore.Timestamp.fromDate(timestamp),
        updatedAt: admin.firestore.Timestamp.fromDate(timestamp),
        usageCount: 1,
        lastUsedAt: admin.firestore.Timestamp.fromDate(timestamp),
      },
      { merge: true }
    )

    console.log("✅ Recipe cached in Firebase:", queryHash)
    return true
  } catch (error) {
    console.error("❌ Error saving recipe cache:", error)
    return false
  }
}

/**
 * Increment usage count for cached recipe
 */
export async function incrementRecipeUsage(queryHash: string) {
  try {
    const db = getFirestore()
    await db.collection("cached_recipes").doc(queryHash).update({
      usageCount: admin.firestore.FieldValue.increment(1),
      lastUsedAt: admin.firestore.Timestamp.now(),
    })
  } catch (error) {
    console.error("❌ Error incrementing usage count:", error)
  }
}

/**
 * Get cached recipe by exact hash match
 */
export async function getCachedRecipe(queryHash: string) {
  try {
    const db = getFirestore()
    const doc = await db.collection("cached_recipes").doc(queryHash).get()

    if (doc.exists) {
      console.log("✅ Found cached recipe:", queryHash)
      await incrementRecipeUsage(queryHash)
      return doc.data()
    }

    console.log("❌ No cached recipe found:", queryHash)
    return null
  } catch (error) {
    console.error("❌ Error fetching cached recipe:", error)
    return null
  }
}

/**
 * Search for similar recipes in cache
 */
export async function findSimilarRecipes(
  input: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  },
  limit: number = 5
) {
  try {
    const db = getFirestore()

    // Search by country and protein first (exact match)
    const exactMatches = await db
      .collection("cached_recipes")
      .where("input.country", "==", input.country)
      .where("input.protein", "==", input.protein)
      .orderBy("usageCount", "desc")
      .limit(limit)
      .get()

    const results = exactMatches.docs.map((doc) => ({
      queryHash: doc.id,
      ...doc.data(),
      similarity: 0.9, // High similarity due to exact match
    }))

    console.log(`✅ Found ${results.length} similar recipes`)
    return results
  } catch (error) {
    console.error("❌ Error searching for similar recipes:", error)
    return []
  }
}

/**
 * Get top cached recipes by usage
 */
export async function getPopularRecipes(limit: number = 10) {
  try {
    const db = getFirestore()
    const snapshot = await db
      .collection("cached_recipes")
      .orderBy("usageCount", "desc")
      .limit(limit)
      .get()

    return snapshot.docs.map((doc) => ({
      queryHash: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error("❌ Error fetching popular recipes:", error)
    return []
  }
}

/**
 * Clear old cached recipes (older than 30 days)
 */
export async function clearOldCache(daysOld: number = 30) {
  try {
    const db = getFirestore()
    const thirtyDaysAgo = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

    const oldDocs = await db
      .collection("cached_recipes")
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .get()

    let deletedCount = 0
    for (const doc of oldDocs.docs) {
      await doc.ref.delete()
      deletedCount++
    }

    console.log(`✅ Cleared ${deletedCount} old cached recipes`)
    return deletedCount
  } catch (error) {
    console.error("❌ Error clearing old cache:", error)
    return 0
  }
}

/**
 * Save AI-generated recipe to Firebase 'ai_recipes' collection
 * This is separate from the cache collection for published recipes
 */
export async function saveAIRecipeToFirebase(
  recipe: any,
  input: {
    description: string
    country: string
    protein: string
    taste: string[]
    ingredients: string[]
  }
) {
  try {
    const db = getFirestore()
    const timestamp = new Date()

    console.log("🔍 [DIAG-FB-1] saveAIRecipeToFirebase called with recipe:", {
      title: recipe?.title,
      prepTime: recipe?.prepTime,
      cookTime: recipe?.cookTime,
      totalTime: recipe?.totalTime,
      servings: recipe?.servings,
      difficulty: recipe?.difficulty,
      ingredients_count: recipe?.ingredients?.length,
      ingredients_first_item: recipe?.ingredients?.[0],
      instructions_count: recipe?.instructions?.length,
    })

    // Create a document with auto-generated ID
    // Provide default values for missing fields
    // Normalize ingredients to ensure item, amount, unit structure
    const normalizeIngredients = (ingredients: any[]): any[] => {
      if (!Array.isArray(ingredients)) return []
      return ingredients.map((ing: any) => {
        if (typeof ing === "string") {
          return { item: ing, amount: "", unit: "" }
        }
        return {
          item: ing.item || ing.name || "",
          amount: ing.amount !== undefined ? String(ing.amount) : "",
          unit: ing.unit || "",
        }
      })
    }

    const normalizedIngredients = normalizeIngredients(recipe?.ingredients)
    console.log("🔍 [DIAG-FB-2] Normalized ingredients sample:", normalizedIngredients.slice(0, 2))

    const recipeData = {
      title: recipe?.title || "Untitled Recipe",
      servings: recipe?.servings !== undefined ? recipe.servings : 4,
      prepTime: recipe?.prepTime || "",
      cookTime: recipe?.cookTime || "",
      ingredients: normalizedIngredients,
      instructions: Array.isArray(recipe?.instructions)
        ? recipe.instructions
        : typeof recipe?.instructions === "string"
          ? recipe.instructions.split("\n").filter((s: string) => s.trim())
          : [],
      tips: Array.isArray(recipe?.tips) ? recipe.tips : [],
      nutritionInfo: recipe?.nutritionInfo || null,
      // User input metadata
      userInput: {
        description: input?.description || "",
        country: input?.country || "Unknown",
        protein: input?.protein || "Not specified",
        taste: Array.isArray(input?.taste) ? input.taste : [],
        ingredients: Array.isArray(input?.ingredients) ? input.ingredients : [],
      },
      // Metadata
      createdAt: admin.firestore.Timestamp.fromDate(timestamp),
      updatedAt: admin.firestore.Timestamp.fromDate(timestamp),
      source: "ai-chef",
      isPublished: false,
      views: 0,
      likes: 0,
      comments: 0,
    }

    console.log("🔍 [DIAG-FB-3] About to save to Firestore:", {
      title: recipeData.title,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
      ingredients_count: recipeData.ingredients.length,
    })

    const docRef = await db.collection("ai_recipes").add(recipeData)

    console.log(`✅ AI Recipe saved to Firebase with ID: ${docRef.id}`)
    console.log("🔍 [DIAG-FB-4] Saved document data:", {
      title: recipeData.title,
      prepTime: recipeData.prepTime,
      cookTime: recipeData.cookTime,
    })
    return docRef.id
  } catch (error) {
    console.error("❌ Error saving AI recipe to Firebase:", error)
    return null
  }
}

/**
 * Publish an AI-generated recipe (make it visible on the site)
 */
export async function publishAIRecipe(
  recipeId: string,
  metadata: {
    slug?: string
    excerpt?: string
    author?: string
    tags?: string[]
    image?: string
    difficulty?: string
  } = {}
) {
  try {
    const db = getFirestore()
    await db.collection("ai_recipes").doc(recipeId).update({
      isPublished: true,
      publishedAt: admin.firestore.Timestamp.now(),
      ...metadata,
    })

    console.log(`✅ AI Recipe ${recipeId} published`)
    return true
  } catch (error) {
    console.error("❌ Error publishing AI recipe:", error)
    return false
  }
}

/**
 * Helper function to serialize Firestore documents to plain JSON
 * Converts Firestore Timestamp objects to ISO strings
 */
function serializeFirestoreDoc(data: any): any {
  if (!data) return data
  
  // Check if it's a Firestore Timestamp object
  if (data._seconds !== undefined && data._nanoseconds !== undefined) {
    return new Date(data._seconds * 1000 + data._nanoseconds / 1000000).toISOString()
  }
  
  if (data instanceof Date) {
    return data.toISOString()
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreDoc)
  }
  
  if (typeof data === "object" && data !== null) {
    const serialized: any = {}
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreDoc(value)
    }
    return serialized
  }
  
  return data
}

/**
 * Get AI-generated recipes (paginated)
 */
export async function getAIRecipes(
  published: boolean = true,
  limit: number = 10,
  startAfter?: any
) {
  try {
    const db = getFirestore()
    let query = db.collection("ai_recipes") as any

    if (published) {
      query = query.where("isPublished", "==", true)
    }

    query = query.orderBy("createdAt", "desc").limit(limit)

    if (startAfter) {
      query = query.startAfter(startAfter)
    }

    const snapshot = await query.get()
    return snapshot.docs.map((doc: admin.firestore.DocumentSnapshot) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...serializeFirestoreDoc(data),
      }
    })
  } catch (error) {
    console.error("❌ Error fetching AI recipes:", error)
    return []
  }
}

/**
 * Update recipe stats (views, likes, comments)
 */
export async function updateRecipeStats(
  recipeId: string,
  stats: {
    views?: number
    likes?: number
    comments?: number
  }
) {
  try {
    const db = getFirestore()
    const updates: any = {
      updatedAt: admin.firestore.Timestamp.now(),
    }

    if (stats.views !== undefined) {
      updates.views = admin.firestore.FieldValue.increment(stats.views)
    }
    if (stats.likes !== undefined) {
      updates.likes = admin.firestore.FieldValue.increment(stats.likes)
    }
    if (stats.comments !== undefined) {
      updates.comments = admin.firestore.FieldValue.increment(stats.comments)
    }

    await db.collection("ai_recipes").doc(recipeId).update(updates)
    return true
  } catch (error) {
    console.error("❌ Error updating recipe stats:", error)
    return false
  }
}

/**
 * Mark AI recipe as converted to recipe post
 */
export async function markAIRecipeAsConverted(
  recipeId: string,
  recipePostData: {
    slug: string
    author: string
    image?: string
    difficulty?: string
  }
) {
  try {
    const db = getFirestore()
    await db.collection("ai_recipes").doc(recipeId).update({
      isPublished: true,
      convertedAt: admin.firestore.Timestamp.now(),
      convertedTo: recipePostData,
      status: "converted",
    })

    console.log(`✅ AI Recipe ${recipeId} marked as converted`)
    return true
  } catch (error) {
    console.error("❌ Error marking AI recipe as converted:", error)
    return false
  }
}
