import type { Metadata } from "next"
import { generateMetadata as generateSEOMetadata, siteConfig, getCanonicalUrl, faqSchema, breadcrumbSchema } from "@/lib/seo"
import { Container } from "@/components/layout"
import Link from "next/link"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = generateSEOMetadata({
  title: "Frequently Asked Questions - World Food Recipes",
  description: "Find answers to common questions about World Food Recipes. Learn how to use our platform, save recipes, access content, and more.",
  url: getCanonicalUrl('/faq'),
  image: `${siteUrl}/og-image.png`,
  author: siteConfig.author,
}) as Metadata

const faqs = [
  {
    question: "How do I save my favorite recipes?",
    answer: "Click the heart icon on any recipe to save it to your favorites. You can access your saved recipes from the Favorites page in the main navigation menu. Your favorites are stored locally in your browser.",
  },
  {
    question: "Are all recipes free to use?",
    answer: "Yes! All recipes on World Food Recipes are completely free to view, save, and cook. We believe in sharing culinary knowledge and authentic food traditions with everyone. You can use any recipe without restrictions.",
  },
  {
    question: "Can I use your recipes commercially?",
    answer: "Our recipes are provided for personal, non-commercial use. If you're interested in using our recipes for commercial purposes, including restaurants, cooking schools, or published content, please contact us at hello@worldfoodrecipes.sbs.",
  },
  {
    question: "Do you offer recipes for dietary restrictions?",
    answer: "Yes! We have recipes tagged with various dietary options including vegetarian, vegan, gluten-free, and dairy-free options. You can filter recipes by these tags or search for specific dietary requirements.",
  },
  {
    question: "How often is content updated?",
    answer: "We regularly add new recipes, blog posts, and cooking videos to our collection. New content is added weekly, so check back regularly for fresh recipe ideas and food stories from around the world.",
  },
  {
    question: "Can I submit my own recipes?",
    answer: "We love community contributions! If you'd like to submit your own recipes or food stories, please reach out to us at hello@worldfoodrecipes.sbs. We're always excited to feature authentic recipes and culinary experiences from our readers.",
  },
  {
    question: "Is there an offline mode or app?",
    answer: "Yes! World Food Recipes is a Progressive Web App (PWA), which means you can install it on your device just like a native app. Once installed, you can access previously viewed recipes offline. Look for the install button in your browser.",
  },
  {
    question: "What's the source of your recipes?",
    answer: "Our recipes come from authentic culinary traditions, food experts, home cooks, and food culture enthusiasts from around the world. We focus on authentic, traditional recipes that represent genuine food cultures.",
  },
  {
    question: "How can I search for recipes?",
    answer: "Use the search bar at the top of the page to search by recipe name, ingredient, cuisine, or cooking technique. You can also browse by categories like Blog, Recipes, Videos, or filter by tags on individual collection pages.",
  },
  {
    question: "Do you have video tutorials?",
    answer: "Yes! We have a dedicated Videos section featuring cooking tutorials, recipe demonstrations, and food-related content from YouTube. Search for cooking videos or specific recipes to find helpful visual guides.",
  },
  {
    question: "How do I contact you?",
    answer: "You can contact us through our Contact page with any questions, suggestions, or inquiries. You can also reach out via email at hello@worldfoodrecipes.sbs or connect with us on social media.",
  },
  {
    question: "What are the main recipe categories?",
    answer: "Our recipes include various cuisines from around the world: Asian, European, African, American, Mediterranean, Middle Eastern, and more. Each recipe includes details about cuisine type, difficulty level, prep time, and servings.",
  },
]

export default function FAQPage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'FAQ', url: getCanonicalUrl('/faq') },
  ]

  const faqSchemaData = faqSchema(faqs.map(faq => ({
    question: faq.question,
    answer: faq.answer,
  })))

  const breadcrumbData = breadcrumbSchema(breadcrumbs)

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        suppressHydrationWarning
      />
      
      <Container>
        <div className="py-16 md:py-24">
          {/* Header */}
          <header className="mb-12">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-foreground">FAQ</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: 'Georgia, serif' }}>
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find answers to common questions about World Food Recipes, how to use our platform, and get help with recipes and features.
            </p>
          </header>

          {/* FAQ Content */}
          <div className="grid gap-6 md:gap-8">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group border border-shadow-gray rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-background/50 hover:bg-muted/30"
              >
                <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {faq.question}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 md:mt-24 p-8 md:p-12 border border-shadow-gray rounded-lg bg-muted/30">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Didn't find your answer?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6">
              Can't find the answer you're looking for? Get in touch with our team directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
              <a
                href="mailto:hello@worldfoodrecipes.sbs"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
