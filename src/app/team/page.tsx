import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team - Silent Scribe',
  description: 'Meet the team behind Silent Scribe',
}

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Our Team</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Coming soon. We're building something amazing for developers.
      </p>
    </div>
  )
}
