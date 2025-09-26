import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Beta Program | Silent Scribe',
  description: 'Be among the first to experience privacy-first writing assistance designed specifically for developers and technical writers. Join the Silent Scribe beta program.',
  openGraph: {
    title: 'Join the Silent Scribe Beta Program',
    description: 'Privacy-first writing assistance for developers. Local processing, customizable rules, seamless IDE integration.',
    type: 'website',
    url: 'https://silentscribe.dev/beta',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join the Silent Scribe Beta Program',
    description: 'Privacy-first writing assistance for developers. Local processing, customizable rules, seamless IDE integration.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BetaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
