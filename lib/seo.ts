/**
 * SEO Configuration and Utilities
 * Centralized SEO settings for World Food Recipes
 */

export const siteConfig = {
  name: 'World Food Recipes',
  description: 'Discover authentic recipes from around the world. Explore international cuisines, cooking techniques, food stories, and culinary traditions. Your destination for world food blogging and food recipes.',
  domain: 'https://worldfoodrecipes.sbs',
  url: 'https://worldfoodrecipes.sbs',
  locale: 'en_US',
  language: 'en',
  author: 'World Food Recipes',
  email: 'hello@worldfoodrecipes.sbs',
  socialMedia: {
    twitter: '@worldfoodrecipes',
    facebook: 'worldfoodrecipes',
    instagram: 'worldfoodrecipes',
  },
  keywords: [
    'world food recipes',
    'international recipes',
    'food blog',
    'cooking recipes',
    'global cuisine',
    'authentic recipes',
    'food stories',
    'cooking tips',
    'culinary traditions',
    'food recipes',
    'world cuisine',
    'easy recipes',
    'cooking tutorials',
    'recipe ideas',
    'food culture',
    'international cooking',
    'home cooking',
    'food blogging',
    'recipe blog',
    'culinary blog',
  ],
  logo: '/logo.svg',
  favicon: '/favicon.svg',
  ogImage: '/og-image.png',
}

/**
 * Generate SEO metadata for pages
 */
export interface SEOMetadata {
  title: string
  description: string
  url?: string
  image?: string
  author?: string
  publishedDate?: string
  updatedDate?: string
  category?: string
  tags?: string[]
}

export function generateMetadata(metadata: SEOMetadata) {
  const {
    title,
    description,
    url = siteConfig.url,
    image = siteConfig.ogImage,
    author = siteConfig.author,
    publishedDate,
    updatedDate,
  } = metadata

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords: siteConfig.keywords.join(', '),
    authors: [{ name: author }],
    creator: author,
    publisher: siteConfig.name,
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'article' as const,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(publishedDate && { publishedTime: publishedDate }),
      ...(updatedDate && { modifiedTime: updatedDate }),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${title} | ${siteConfig.name}`,
      description,
      creator: siteConfig.socialMedia.twitter,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/**
 * Generate JSON-LD Schema for Organization
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}${siteConfig.logo}`,
    description: siteConfig.description,
    sameAs: [
      `https://twitter.com/${siteConfig.socialMedia.twitter.slice(1)}`,
      `https://facebook.com/${siteConfig.socialMedia.facebook}`,
      `https://instagram.com/${siteConfig.socialMedia.instagram}`,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: siteConfig.email,
    },
  }
}

/**
 * Generate JSON-LD Schema for Website
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Generate JSON-LD Schema for Recipe
 */
export interface RecipeSchemaData {
  name: string
  description: string
  image: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: number
  ingredients?: string[]
  instructions?: string[]
  author?: string
  datePublished?: string
  cuisine?: string
  mealType?: string
}

export function recipeSchema(data: RecipeSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: data.name,
    description: data.description,
    image: data.image,
    author: {
      '@type': 'Organization',
      name: data.author || siteConfig.name,
    },
    ...(data.prepTime && { prepTime: data.prepTime }),
    ...(data.cookTime && { cookTime: data.cookTime }),
    ...(data.totalTime && { totalTime: data.totalTime }),
    ...(data.servings && { recipeYield: `${data.servings} servings` }),
    ...(data.ingredients && { recipeIngredient: data.ingredients }),
    ...(data.instructions && {
      recipeInstructions: data.instructions.map((instruction, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: instruction,
      })),
    }),
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.cuisine && { recipeCuisine: data.cuisine }),
    ...(data.mealType && { recipeCategory: data.mealType }),
  }
}

/**
 * Generate JSON-LD Schema for Article/BlogPost
 */
export interface ArticleSchemaData {
  title: string
  description: string
  image: string
  author?: string
  datePublished?: string
  dateModified?: string
  content?: string
  category?: string
}

export function articleSchema(data: ArticleSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.image,
    author: {
      '@type': 'Organization',
      name: data.author || siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
      },
    },
    ...(data.datePublished && { datePublished: data.datePublished }),
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.content && { articleBody: data.content }),
  }
}

/**
 * Get canonical URL
 */
export function getCanonicalUrl(path: string = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${siteConfig.url}${cleanPath}`
}

/**
 * Generate breadcrumb schema
 */
export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Generate FAQPage schema
 */
export interface FAQItem {
  question: string
  answer: string
}

export function faqSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

/**
 * Generate HomePage/CollectionPage schema
 */
export function homePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    dateModified: new Date().toISOString(),
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
        width: 200,
        height: 200,
      },
    },
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }
}

/**
 * Generate VideoObject schema
 */
export interface VideoSchemaData {
  title: string
  description?: string
  thumbnailUrl: string
  uploadDate?: string
  duration?: string
  videoId: string
  contentUrl?: string
}

export function videoSchema(data: VideoSchemaData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.title,
    description: data.description || data.title,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate || new Date().toISOString(),
    ...(data.duration && { duration: data.duration }),
    contentUrl: data.contentUrl || `https://www.youtube.com/watch?v=${data.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${data.videoId}`,
  }
}

/**
 * Generate CollectionPage schema for list pages (blog, recipes, videos)
 */
export interface CollectionPageData {
  title: string
  description: string
  url: string
  itemCount: number
}

export function collectionPageSchema(data: CollectionPageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.title,
    description: data.description,
    url: data.url,
    numberOfItems: data.itemCount,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}${siteConfig.logo}`,
        width: 200,
        height: 200,
      },
    },
  }
}
