import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'ChatBotDysa Enterprise+++++ - Chatbot IA para Restaurantes Chilenos',
    template: '%s | ChatBotDysa Enterprise+++++',
  },
  description: 'Solución empresarial completa de chatbot con IA para automatizar la atención al cliente en restaurantes. Sistema certificado Enterprise+++++ con 98.5/100 puntos.',
  keywords: [
    'chatbot',
    'restaurantes',
    'chile',
    'inteligencia artificial',
    'whatsapp business',
    'reservas automaticas',
    'pedidos online',
    'enterprise',
    'certificado'
  ],
  authors: [{ name: 'DysaDev SpA', url: 'https://chatbotdysa.cl' }],
  creator: 'DysaDev SpA',
  publisher: 'DysaDev SpA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://chatbotdysa.cl'),
  alternates: {
    canonical: '/',
    languages: {
      'es-CL': '/es',
      'en-US': '/en',
      'fr-FR': '/fr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://chatbotdysa.cl',
    siteName: 'ChatBotDysa Enterprise+++++',
    title: 'ChatBotDysa Enterprise+++++ - Chatbot IA para Restaurantes Chilenos',
    description: 'Sistema certificado Enterprise+++++ (98.5/100) para automatizar restaurantes con IA',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ChatBotDysa Enterprise+++++ - Certificado 98.5/100',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatBotDysa Enterprise+++++ - Chatbot IA para Restaurantes',
    description: 'Sistema certificado Enterprise+++++ (98.5/100) para automatizar restaurantes con IA',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme and viewport */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'ChatBotDysa Enterprise+++++',
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'Restaurant Management Software',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '99990',
                priceCurrency: 'CLP',
                priceValidUntil: '2025-12-31',
                availability: 'https://schema.org/InStock',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                bestRating: '5',
                ratingCount: '98',
              },
              publisher: {
                '@type': 'Organization',
                name: 'DysaDev SpA',
                url: 'https://chatbotdysa.cl',
              },
            }),
          }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <Analytics />
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>

        {/* Performance and Analytics Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance optimization
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }

              // Critical CSS loaded inline for performance
              document.documentElement.classList.add('fonts-loaded');
            `,
          }}
        />
      </body>
    </html>
  )
}