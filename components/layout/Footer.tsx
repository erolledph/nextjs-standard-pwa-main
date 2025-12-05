import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block border-shadow-gray bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
          <Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">
            Disclaimer
          </Link>
          <Link href="/admin/login" className="text-muted-foreground hover:text-foreground transition-colors">
            Write
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#FF7518' }}>World Food Recipes</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {currentYear} World Food Recipes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
