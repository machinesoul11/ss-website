import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Roadmap - Silent Scribe',
  description: 'Product roadmap and future plans for Silent Scribe',
}

export default function RoadmapPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Product Roadmap</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our roadmap is coming soon. We're planning exciting features for
        developers.
      </p>
    </div>
  )
}
