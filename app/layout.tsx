import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { ThemeProvider } from '@/components/theme-provider'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { PageTransitionProvider } from '@/components/page-transition-provider'
import { WebVitalsReporter } from '@/components/web-vitals-reporter'
import { generateMetadata as generateSEOMetadata, organizationSchema, websiteSchema, siteConfig } from '@/lib/seo'
import { Toaster } from 'sonner'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} - Authentic Recipes & Food Stories`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  referrer: 'origin-when-cross-origin',
  creator: siteConfig.author,
  publisher: siteConfig.name,
  authors: [{ name: siteConfig.author, url: siteUrl }],
  openGraph: {
    title: `${siteConfig.name} - Authentic Recipes & Food Stories`,
    description: siteConfig.description,
    url: siteUrl,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Authentic Recipes & Food Stories`,
    description: siteConfig.description,
    creator: siteConfig.socialMedia.twitter,
    images: [`${siteUrl}/og-image.png`],
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
  alternates: {
    canonical: siteUrl,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF7518" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#FF7518" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#FF7518" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={siteConfig.name} />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#FF7518" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content={siteConfig.locale} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="author" content={siteConfig.author} />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
        />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-9N7NDX1TRK"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9N7NDX1TRK');
          `
        }} />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <PageTransitionProvider />
          <PWAProvider>
            <Header />
            <div className="flex-1 pb-20 md:pb-0">
              {children}
            </div>
            <Footer />
            <BottomNav />
            <InstallPrompt />
            <Toaster position="top-center" richColors closeButton />
          </PWAProvider>
        </ThemeProvider>
        <WebVitalsReporter />
      </body>
    </html>
  )
}
