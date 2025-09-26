import React from 'react'

interface Activity {
  type: 'signup' | 'email_event' | 'feedback'
  timestamp: string
  user_email?: string
  details: string
}

interface RecentActivityFeedProps {
  activities: Activity[]
  title: string
}

export function RecentActivityFeed({
  activities,
  title,
}: RecentActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return '👤'
      case 'email_event':
        return '✉️'
      case 'feedback':
        return '💬'
      default:
        return '📊'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signup':
        return 'bg-green-100 text-green-800'
      case 'email_event':
        return 'bg-blue-100 text-blue-800'
      case 'feedback':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">📈</span>
          {title}
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}
                      >
                        {activity.type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {activity.details}
                    </p>
                    {activity.user_email && (
                      <p className="mt-1 text-xs text-gray-600">
                        {activity.user_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
