import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Terms of Service - World Food Recipes",
  description: "Review the terms of service for using World Food Recipes. Understand our conditions for accessing recipes, food blogging content, and cooking tutorials.",
  url: getCanonicalUrl('/terms'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: 'Georgia, serif' }}>Terms</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Keep it simple</p>
        </header>
      </div>

      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg pb-16">
        <div className="space-y-8 max-w-none">
          <section>
            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>The Basics</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              This is my personal blog. You're free to read anything here. That's about it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>My Content</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              Everything I write here is mine. Feel free to share links to posts, but don't copy my content wholesale and claim it as yours. That's not cool.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>No Guarantees</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              These are my personal thoughts and opinions. They might be wrong, they might change, they might not make sense later. Don't take anything here as professional advice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Be Cool</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              Don't try to hack the site, don't be malicious, don't do anything illegal. Just... be cool.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Changes</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              I might update these terms if needed. Or I might not. This is a personal blog, not a corporation.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
