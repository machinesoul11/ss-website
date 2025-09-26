import React, { useState, useEffect } from 'react'
import type { BetaSignup } from '@/types'

interface RealTimeSignupCounterProps {
  signups: BetaSignup[]
}

export function RealTimeSignupCounter({ signups }: RealTimeSignupCounterProps) {
  const [animateNew, setAnimateNew] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  useEffect(() => {
    if (signups.length > prevCount) {
      setAnimateNew(true)
      setTimeout(() => setAnimateNew(false), 1000)
    }
    setPrevCount(signups.length)
  }, [signups.length, prevCount])

  const getTimeAgo = (timestamp: string) => {
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
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🔥</span>
          Live Signups
          {animateNew && (
            <span className="ml-2 animate-bounce bg-green-500 text-white text-xs rounded-full px-2 py-1">
              NEW!
            </span>
          )}
        </h3>
      </div>
      
      <div className="p-4">
        {signups.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📊</div>
            <p>Waiting for new signups...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signups.slice(0, 5).map((signup, index) => (
              <div 
                key={signup.id}
                className={`p-3 rounded-lg border transition-all duration-500 ${
                  index === 0 && animateNew 
                    ? 'bg-green-50 border-green-200 scale-105' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {signup.email}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      {signup.github_username && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          GitHub: {signup.github_username}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        signup.beta_status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : signup.beta_status === 'invited'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {signup.beta_status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {getTimeAgo(signup.created_at)}
                  </div>
                </div>
                
                {signup.use_case_description && (
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {signup.use_case_description}
                  </p>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {signup.current_tools.slice(0, 2).map((tool, toolIndex) => (
                      <span 
                        key={toolIndex}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                    {signup.current_tools.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{signup.current_tools.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">
                      Score: {signup.engagement_score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {signups.length > 5 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                +{signups.length - 5} more recent signups
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
