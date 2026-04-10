import type { Metadata } from 'next'
import { Prompt, Sarabun } from 'next/font/google'
import { SessionProvider } from '@/components/SessionProvider'
import './globals.css'

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['600', '700', '800'],
  variable: '--font-prompt',
  display: 'swap',
})

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '600'],
  variable: '--font-sarabun',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'ThinkBiz Lab — ห้องทดลองความคิดธุรกิจ', template: '%s | ThinkBiz Lab' },
  description: 'ThinkBiz Lab คลังความรู้ธุรกิจภาษาไทย วิเคราะห์และแชร์ Business Insight สำหรับ SME เจ้าของธุรกิจ นักลงทุน และผู้ที่อยากคิดแบบนักธุรกิจ',
  keywords: ['ธุรกิจ', 'SME', 'Startup', 'Business Insight', 'การลงทุน', 'ThinkBiz Lab'],
  authors: [{ name: 'ThinkBiz Lab', url: 'https://thinkbizlab.com' }],
  creator: 'ThinkBiz Lab',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thinkbizlab.com'),
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    siteName: 'ThinkBiz Lab',
    locale: 'th_TH',
    type: 'website',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ThinkBiz Lab',
  url: 'https://thinkbizlab.com',
  logo: 'https://thinkbizlab.com/brand/logo-light.svg',
  description: 'ห้องทดลองความคิดธุรกิจ — คลังความรู้ธุรกิจภาษาไทย',
  contactPoint: { '@type': 'ContactPoint', email: 'thinkbizlab@gmail.com', contactType: 'customer service' },
  sameAs: ['https://www.facebook.com/thinkbizlab', 'https://www.instagram.com/thinkbizlab'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className="font-body antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
