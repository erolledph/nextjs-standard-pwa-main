import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home, Search } from "lucide-react"
import { typography, responsive } from "@/lib/design-system"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className={`${responsive.pageContainer} text-center`}>
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-8 backdrop-blur-sm">
            <FileQuestion className="w-20 h-20 text-primary" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className={`${typography.display.lg} mb-4 text-foreground`}>
          404
        </h1>

        {/* Subheading */}
        <h2 className={`${typography.heading.h2} mb-6 text-foreground`}>
          Page Not Found
        </h2>

        {/* Description */}
        <p className={`${typography.body.lg} text-muted-foreground mb-8 max-w-2xl mx-auto`}>
          We couldn't find what you're looking for. The page may have been moved, deleted, or perhaps never existed. Let's get you back on track.
        </p>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/">
            <Button size="lg" className="rounded-full w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>

          <Link href="/blog">
            <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto gap-2">
              <Search className="w-4 h-4" />
              Browse Stories
            </Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-12 pt-8 border-t border-border/50">
          {/* Secondary Navigation */}
          <p className={`${typography.body.sm} text-muted-foreground mb-6`}>
            Quick Links
          </p>
          
          <nav className="flex flex-wrap gap-6 justify-center">
            <Link href="/recipes" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Recipes
            </Link>
            <span className="text-border">•</span>
            <Link href="/about" className="text-primary hover:text-primary/80 transition-colors font-medium">
              About
            </Link>
            <span className="text-border">•</span>
            <Link href="/contact" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Contact
            </Link>
            <span className="text-border">•</span>
            <Link href="/search" className="text-primary hover:text-primary/80 transition-colors font-medium">
              Search
            </Link>
          </nav>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className={`${typography.body.sm} text-muted-foreground`}>
            Need more help? <Link href="/contact" className="text-primary hover:underline font-medium">Get in touch with us</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
