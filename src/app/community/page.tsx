import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community - Silent Scribe',
  description: 'Join the Silent Scribe developer community',
}

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Community</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Our community platform is coming soon. Connect with fellow developers.
      </p>
    </div>
  )
}
