import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "About World Food Recipes - Our Story",
  description: "Discover the story behind World Food Recipes. We're passionate about food blogging and sharing authentic international recipes, cooking tips, and culinary traditions from around the world.",
  url: getCanonicalUrl('/about'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: 'Georgia, serif' }}>About This Blog</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Your thoughts, your voice, your platform</p>
        </header>
      </div>

      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg pb-16">
        <div className="max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>What is this place?</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              This is a blog dedicated to sharing thoughts, insights, and stories. No filters, no corporate speak, no marketing jargon. Just authentic content and genuine ideas.
            </p>
            <p className="text-lg text-foreground/90 leading-relaxed">
              This platform is powered by modern technology that lets you focus on what matters most—creating great content.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Why write here</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              In a world of social media algorithms and walled gardens, having your own blog is an act of independence. Write what you want, when you want, without worrying about engagement metrics or platform changes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Built with modern tech</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-6">
              This blogging platform is built with Next.js and deployed on Cloudflare Pages. Simple, fast, and exactly what you need to share your ideas with the world.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}