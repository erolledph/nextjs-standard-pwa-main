/**
 * AI Chef Page
 * Smart recipe search with caching, fuzzy matching, and AI generation
 */

import { Metadata } from "next"
import { AIChefPageImproved } from "@/components/ai-chef/AIChefPageImproved"

export const metadata: Metadata = {
  title: "AI Chef - Smart Recipe Search & Generation",
  description:
    "Search our database for recipes or generate new ones with AI. We cache results to keep costs at zero while learning your preferences.",
  keywords: [
    "AI recipe generator",
    "recipe search",
    "meal planning",
    "cooking assistant",
    "smart caching",
  ],
  openGraph: {
    title: "AI Chef - Smart Recipe Generator",
    description: "Search and generate recipes with zero billing",
    type: "website",
  },
}

export default function AIChefPage() {
  return <AIChefPageImproved />
}
