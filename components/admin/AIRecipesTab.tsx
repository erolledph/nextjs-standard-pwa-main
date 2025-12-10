"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function AIRecipesTab() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchAiRecipes() {
      try {
        const response = await fetch("/api/admin/ai-recipes") // Corrected endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch AI recipes")
        }
        const data = await response.json()
        setRecipes(data.recipes)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAiRecipes()
  }, [])

  // Helper function to safely format date
  const formatDate = (createdAt: any) => {
    try {
      if (!createdAt) return "N/A"
      // Handle Firestore Timestamp
      if (typeof createdAt === 'object' && createdAt._seconds) {
        return new Date(createdAt._seconds * 1000).toLocaleString()
      }
      // Handle standard Date string or ISO string
      return new Date(createdAt).toLocaleString()
    } catch (e) {
      return "Invalid Date"
    }
  }

  // Helper function to safely render ingredients
  const renderIngredients = (ingredients: any) => {
    if (!ingredients) return <p className="text-sm text-gray-500">No ingredients listed</p>

    if (Array.isArray(ingredients)) {
      return (
        <ul className="list-disc pl-6">
          {ingredients.map((ing: any, i: number) => {
             // Handle if ingredient is object { item, amount, unit } or string
             const text = typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.item || ''}`.trim()
             return <li key={i}>{text}</li>
          })}
        </ul>
      )
    }

    // Fallback for string
    return <p>{String(ingredients)}</p>
  }

  // Helper function to safely render instructions
  const renderInstructions = (instructions: any) => {
    if (!instructions) return <p className="text-sm text-gray-500">No instructions listed</p>

    if (Array.isArray(instructions)) {
      return (
        <ol className="list-decimal pl-6 space-y-2">
           {instructions.map((step: any, i: number) => (
             <li key={i}>{String(step)}</li>
           ))}
        </ol>
      )
    }

    // Fallback for HTML string
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{
          __html: String(instructions),
        }}
      />
    )
  }

  const handleView = (recipe: any) => {
    setSelectedRecipe(recipe)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (recipeId: string) => {
    setRecipeToDelete(recipeId)
    setIsDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!recipeToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch("/api/admin/ai-recipes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recipeToDelete }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete recipe")
      }

      setRecipes(recipes.filter(recipe => recipe.id !== recipeToDelete))
      toast.success("AI recipe deleted successfully.")
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsDeleting(false)
      setIsDeleteConfirmOpen(false)
      setRecipeToDelete(null)
    }
  }

  const handleConvertToPost = (recipe: any) => {
    setIsConverting(true)
    // Use localStorage to pass the recipe data
    // This is a simple way to pass data to a new page without using complex state management
    try {
      localStorage.setItem("ai-recipe-to-convert", JSON.stringify(recipe))
      toast.success(
        "Redirecting to create new post page with recipe data..."
      )
      router.push("/admin/create")
    } catch (error) {
      console.error("Failed to save recipe to localStorage", error)
      toast.error(
        "Could not prepare recipe for conversion. See console for details."
      )
      setIsConverting(false)
    }
    // No need to setIsConverting(false) here if navigation is successful
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">AI-Generated Recipes</h3>
      {recipes.length === 0 ? (
        <p>No AI-generated recipes found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes.map(recipe => (
              <TableRow key={recipe.id}>
                <TableCell className="font-medium">{recipe.title}</TableCell>
                <TableCell>{recipe.cuisine}</TableCell>
                <TableCell>
                  {formatDate(recipe.createdAt)}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(recipe)}>
                    View
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleConvertToPost(recipe)}
                    disabled={isConverting}
                  >
                    {isConverting ? "Converting..." : "Convert to Post"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(recipe.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* View Recipe Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedRecipe?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4">
            <h4 className="font-bold mt-4">Ingredients:</h4>
            {renderIngredients(selectedRecipe?.ingredients)}

            <h4 className="font-bold mt-4">Instructions:</h4>
            {renderInstructions(selectedRecipe?.instructions)}

             <h4 className="font-bold mt-4">Meta:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
                {selectedRecipe?.cuisine && <Badge variant="info">Cuisine: {selectedRecipe.cuisine}</Badge>}
                {selectedRecipe?.diet && <Badge variant="info">Diet: {selectedRecipe.diet}</Badge>}
                {selectedRecipe?.difficulty && <Badge variant="info">Difficulty: {selectedRecipe.difficulty}</Badge>}
            </div>

            {selectedRecipe?.userInput && (
                <div className="mt-6 p-4 bg-muted rounded-md text-sm">
                    <h5 className="font-semibold mb-2">Generated from Request:</h5>
                    <p><strong>Description:</strong> {selectedRecipe.userInput.description}</p>
                    <p><strong>Protein:</strong> {selectedRecipe.userInput.protein}</p>
                    {selectedRecipe.userInput.ingredients && (
                         <p><strong>Must Include:</strong> {selectedRecipe.userInput.ingredients.join(', ')}</p>
                    )}
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <div>
            <p>
              This action cannot be undone. This will permanently delete the
              AI-generated recipe.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
