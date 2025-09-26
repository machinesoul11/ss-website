import React from 'react'

interface LiveStatsCardProps {
  title: string
  value: number
  icon: string
  trend: string
  trendColor: 'green' | 'blue' | 'yellow' | 'red'
}

export function LiveStatsCard({ title, value, icon, trend, trendColor }: LiveStatsCardProps) {
  const getTrendColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600'
      case 'blue': return 'text-blue-600'
      case 'yellow': return 'text-yellow-600'
      case 'red': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`text-sm font-medium ${getTrendColorClass(trendColor)}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}
