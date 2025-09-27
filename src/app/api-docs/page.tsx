import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Documentation - Silent Scribe',
  description: 'API documentation for Silent Scribe',
}

export default function APIDocsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">API Documentation</h1>
      <p className="text-lg text-muted-foreground mb-8">
        API documentation is coming soon. Stay tuned for developer resources.
      </p>
    </div>
  )
}
