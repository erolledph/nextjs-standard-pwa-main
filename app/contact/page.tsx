import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Contact Us - World Food Recipes",
  description: "Have questions about recipes, food blogging, or our world food content? Contact World Food Recipes. We're here to help with all your culinary inquiries.",
  url: getCanonicalUrl('/contact'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: 'Georgia, serif' }}>Get In Touch</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">Want to reach out?</p>
        </header>
      </div>

      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg pb-16">
        <div className="space-y-8 max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Say hello</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-8">
              If you want to say hello, share thoughts on a post, or just chat, feel free to reach out. I can't promise I'll reply quickly, but I do read everything.
            </p>
                        <div className="rounded-lg border border-shadow-gray p-6 bg-muted/20 inline-block">
              <p className="text-muted-foreground mb-2">Drop me an email:</p>
              <a href="mailto:hello@example.com" className="text-primary hover:underline text-lg">
                youremail@mail.com
              </a>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Find Me Online</h2>
            <p className="text-lg text-foreground/90 mb-6">
              I'm occasionally active on these platforms:
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.facebook.com" className="text-primary hover:underline">Facebook</a>
              <span className="text-muted-foreground">•</span>
              <a href="https://github.com" className="text-primary hover:underline">GitHub</a>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
