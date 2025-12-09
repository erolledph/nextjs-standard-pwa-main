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
                  {new Date(
                    recipe.createdAt?._seconds * 1000
                  ).toLocaleString()}
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
            <ul className="list-disc pl-6">
              {selectedRecipe?.ingredients?.map((ing: string, i: number) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h4 className="font-bold mt-4">Instructions:</h4>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: selectedRecipe?.instructions || "",
              }}
            />
             <h4 className="font-bold mt-4">Meta:</h4>
            <p><strong>Cuisine:</strong> {selectedRecipe?.cuisine}</p>
            <p><strong>Diet:</strong> {selectedRecipe?.diet}</p>
            <p><strong>Method:</strong> {selectedRecipe?.method}</p>
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
