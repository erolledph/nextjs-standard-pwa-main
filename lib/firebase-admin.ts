/**
 * Firebase REST API implementation for server-side operations in an Edge environment.
 * This replaces firebase-admin, which is not compatible with the Edge Runtime.
 */

import * as jose from 'jose';

interface AccessToken {
  token: string;
  expiresAt: number;
}

let cachedToken: AccessToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Missing Firebase credentials in environment variables');
  }

  const alg = 'RS256';
  const privateKeyObject = await jose.importPKCS8(privateKey, alg);

  const jwt = await new jose.SignJWT({
    scope: 'https://www.googleapis.com/auth/datastore',
  })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer(clientEmail)
    .setAudience('https://oauth2.googleapis.com/token')
    .setExpirationTime('1h')
    .sign(privateKeyObject);

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + tokenData.expires_in * 1000 - 60000, // Refresh 1 minute before expiry
  };

  return cachedToken.token;
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const firestoreApiUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

// Helper to convert JS objects to Firestore's format
function toFirestoreValue(value: any): any {
    if (value === null || value === undefined) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return { integerValue: value };
      return { doubleValue: value };
    }
    if (typeof value === 'boolean') return { booleanValue: value };
    if (value instanceof Date) return { timestampValue: value.toISOString() };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
    if (typeof value === 'object') {
      const fields: { [key: string]: any } = {};
      for (const key in value) {
        fields[key] = toFirestoreValue(value[key]);
      }
      return { mapValue: { fields } };
    }
    return {};
  }
  

// Helper to convert Firestore documents back to JS objects
function fromFirestoreDocument(doc: any): any {
    if (!doc.fields) return {};
    const jsObject: { [key: string]: any } = { id: doc.name.split('/').pop() };
    for (const key in doc.fields) {
        jsObject[key] = fromFirestoreValue(doc.fields[key]);
    }
    return jsObject;
}

function fromFirestoreValue(firestoreValue: any): any {
    if (firestoreValue.stringValue !== undefined) return firestoreValue.stringValue;
    if (firestoreValue.integerValue !== undefined) return parseInt(firestoreValue.integerValue, 10);
    if (firestoreValue.doubleValue !== undefined) return firestoreValue.doubleValue;
    if (firestoreValue.booleanValue !== undefined) return firestoreValue.booleanValue;
    if (firestoreValue.timestampValue !== undefined) return new Date(firestoreValue.timestampValue);
    if (firestoreValue.nullValue !== undefined) return null;
    if (firestoreValue.arrayValue) return firestoreValue.arrayValue.values.map(fromFirestoreValue);
    if (firestoreValue.mapValue) {
      const map: { [key: string]: any } = {};
      for (const key in firestoreValue.mapValue.fields) {
        map[key] = fromFirestoreValue(firestoreValue.mapValue.fields[key]);
      }
      return map;
    }
    return undefined;
  }

export async function saveAIRecipeToFirebase(recipe: any, userInput: any) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/ai_recipes`;

        const firestoreDoc = {
            fields: toFirestoreValue(
                {
                    ...recipe,
                    userInput,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isPublished: false,
                    source: 'ai-generated'
                }
            ).mapValue.fields
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(firestoreDoc),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to save recipe: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data.name.split('/').pop();
    } catch (error) {
        console.error("❌ Error saving AI recipe to Firebase:", error);
        return null;
    }
}

export async function getAIRecipes(published: boolean = true) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/ai_recipes`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to get recipes: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        if (!data.documents) return [];
        
        return data.documents.map(fromFirestoreDocument);
    } catch (error) {
        console.error("❌ Error fetching AI recipes:", error);
        return [];
    }
}

export async function deleteAIRecipe(recipeId: string) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/ai_recipes/${recipeId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to delete recipe: ${JSON.stringify(error)}`);
        }

        return true;
    } catch (error) {
        console.error("❌ Error deleting AI recipe:", error);
        return false;
    }
}

// The following functions are now broken because they relied on firebase-admin.
// They need to be rewritten to use the REST API if they are still needed.

export async function saveRecipeToCache() {
    console.error("saveRecipeToCache is not implemented for Edge runtime");
    return false;
}
export async function incrementRecipeUsage() {
    console.error("incrementRecipeUsage is not implemented for Edge runtime");
}
export async function getCachedRecipe() {
    console.error("getCachedRecipe is not implemented for Edge runtime");
    return null;
}
export async function findSimilarRecipes() {
    console.error("findSimilarRecipes is not implemented for Edge runtime");
    return [];
}
export async function getPopularRecipes() {
    console.error("getPopularRecipes is not implemented for Edge runtime");
    return [];
}
export async function clearOldCache() {
    console.error("clearOldCache is not implemented for Edge runtime");
    return 0;
}
export async function publishAIRecipe() {
    console.error("publishAIRecipe is not implemented for Edge runtime");
    return false;
}
export async function updateRecipeStats() {
    console.error("updateRecipeStats is not implemented for Edge runtime");
    return false;
}
export async function markAIRecipeAsConverted() {
    console.error("markAIRecipeAsConverted is not implemented for Edge runtime");
    return false;
}

// Firebase functions for comments and subscribers

export async function firestoreQuery(collection: string, filters?: any[]) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/${collection}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to query collection: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        if (!data.documents) return [];
        
        return data.documents.map(fromFirestoreDocument);
    } catch (error) {
        console.error(`Error querying ${collection}:`, error);
        return [];
    }
}

export async function firestoreAdd(collection: string, data: any) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/${collection}`;

        const body = {
            fields: Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])
            ),
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to add document: ${JSON.stringify(error)}`);
        }

        const result = await response.json();
        return result.name.split('/').pop();
    } catch (error) {
        console.error(`Error adding document to ${collection}:`, error);
        return null;
    }
}

export async function firestoreDelete(collection: string, docId: string) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/${collection}/${docId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to delete document: ${JSON.stringify(error)}`);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting from ${collection}:`, error);
        return false;
    }
}

export async function firestoreUpdate(collection: string, docId: string, data: any) {
    try {
        const accessToken = await getAccessToken();
        const url = `${firestoreApiUrl}/${collection}/${docId}`;

        const body = {
            fields: Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])
            ),
        };

        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Failed to update document: ${JSON.stringify(error)}`);
        }

        return true;
    } catch (error) {
        console.error(`Error updating ${collection}:`, error);
        return false;
    }
}