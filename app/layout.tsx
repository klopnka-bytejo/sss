import React from "react"
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/contexts/cart-context'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Elevate Gaming - Premium Gaming Services Marketplace',
  description: 'The premier marketplace for gaming services. Find expert boosters, coaches, and account services for your favorite games. Secure payments, verified PROs, and 24/7 support.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    title: 'Elevate Gaming - Premium Gaming Services Marketplace',
    description: 'The premier marketplace for gaming services. Find expert boosters, coaches, and account services for your favorite games.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Elevate Gaming Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Elevate Gaming - Premium Gaming Services Marketplace',
    description: 'The premier marketplace for gaming services. Find expert boosters, coaches, and account services for your favorite games.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
