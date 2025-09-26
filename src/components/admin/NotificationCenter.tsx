import React, { useState } from 'react'

interface Notification {
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
  data: Record<string, unknown>
}

interface NotificationCenterProps {
  notifications: Notification[]
  onDismiss: (index: number) => void
}

export function NotificationCenter({ notifications, onDismiss }: NotificationCenterProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'info': return 'ℹ️'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    return date.toLocaleTimeString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2">🔔</span>
            Notifications
            {notifications.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {notifications.length}
              </span>
            )}
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.slice(0, 10).map((notification, index) => (
                <div key={index} className={`p-4 border-l-4 ${getNotificationColor(notification.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDismiss(index)
                      }}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 10 && (
            <div className="p-4 bg-gray-50 text-center">
              <p className="text-sm text-gray-600">
                {notifications.length - 10} more notifications...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
