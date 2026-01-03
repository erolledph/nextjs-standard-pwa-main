import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WifiOff, Chrome as Home } from "lucide-react"
import { ClientReloadButton } from "@/components/ui/client-reload-button"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "You're Offline | World Food Recipes",
  description: "This page is available offline. Check out our latest recipes and content when you're back online.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-screen-lg mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <WifiOff className="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          You're Offline
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          No internet connection detected. You can still browse previously visited pages and posts that have been cached.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ClientReloadButton />

          <Link href="/">
            <Button variant="outline" className="rounded-full w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-shadow-gray">
          <p className="text-sm text-muted-foreground mb-4">
            While offline, you can:
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Browse cached blog posts</p>
            <p>• Navigate between previously visited pages</p>
            <p>• Access the home page and blog listing</p>
          </div>
        </div>
      </div>
    </main>
  )
}