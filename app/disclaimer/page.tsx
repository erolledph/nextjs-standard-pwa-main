import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl } from "@/lib/seo"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Disclaimer",
  description: "Important disclaimer for World Food Recipes. Learn about nutritional information, recipe modifications, and cooking safety when using our world food recipes and cooking tutorials.",
  url: getCanonicalUrl('/disclaimer'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container px-4 sm:px-8 mx-auto xl:px-5 max-w-screen-lg py-16 md:py-24">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6" style={{ fontFamily: 'Georgia, serif' }}>Content Disclaimer</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">The fine print</p>
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
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>About This Content</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              This is a personal blog. Everything here represents my own thoughts, opinions, and experiences. I'm not speaking for anyone else, any company, or any organization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Not Professional Advice</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              Nothing I write here is professional advice of any kind. Don't make important decisions based solely on my random blog posts. Do your own research and consult actual professionals when needed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Accuracy</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              I try to be accurate, but I'm human. I make mistakes. Information might be outdated. My opinions might change. If you spot something wrong, feel free to let me know.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>External Links</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              I might link to other websites. I don't control those sites and I'm not responsible for their content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>Use At Your Own Risk</h2>
            <p className="text-lg text-foreground/90 leading-relaxed mb-4">
              If you use any information from this blog, you do so at your own risk. I'm not liable for anything that happens as a result.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
