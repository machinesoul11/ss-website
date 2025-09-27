import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support - Silent Scribe',
  description: 'Get help and support for Silent Scribe',
}

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Support</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our support center is coming soon. We're here to help developers
        succeed.
      </p>
    </div>
  )
}
