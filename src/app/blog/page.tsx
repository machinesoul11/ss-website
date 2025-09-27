import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Silent Scribe',
  description: 'Latest news and insights from Silent Scribe',
}

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our blog is coming soon. Stay tuned for insights on developer
        productivity.
      </p>
    </div>
  )
}
