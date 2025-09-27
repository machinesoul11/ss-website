import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation - Silent Scribe',
  description: 'Documentation and guides for Silent Scribe',
}

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Documentation is coming soon. We're preparing comprehensive guides for
        developers.
      </p>
    </div>
  )
}
