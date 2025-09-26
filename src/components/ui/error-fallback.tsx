'use client'

interface ErrorFallbackProps {
  title?: string
  message?: string
  showReloadButton?: boolean
}

export function ErrorFallback({
  title = 'Application Error',
  message = 'Something went wrong. Please refresh the page or try again later.',
  showReloadButton = true,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6 max-w-md">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 mb-4">{message}</p>
        {showReloadButton && (
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reload Page
          </button>
        )}
      </div>
    </div>
  )
}

export function HeaderErrorFallback() {
  return (
    <div className="bg-red-50 border-b border-red-200 p-4">
      <div className="text-center text-red-700">
        <p>
          Header component failed to load. Some navigation features may be
          unavailable.
        </p>
      </div>
    </div>
  )
}

export function FooterErrorFallback() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 text-center">
        <p>Footer content unavailable</p>
      </div>
    </footer>
  )
}
