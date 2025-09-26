import React, { useState, useEffect } from 'react'

export function SystemHealthMonitor() {
  const [healthData, setHealthData] = useState({
    database: { status: 'healthy', latency: 0, uptime: '99.9%' },
    email: { status: 'healthy', deliveryRate: 98.5, bounceRate: 1.2 },
    realtime: { status: 'active', connections: 0, messagesSent: 0 },
    api: { status: 'healthy', responseTime: 0, errorRate: 0.1 }
  })
  
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate health monitoring with realistic data
  useEffect(() => {
    const updateHealth = () => {
      setHealthData({
        database: {
          status: Math.random() > 0.1 ? 'healthy' : 'warning',
          latency: Math.round(Math.random() * 50 + 10), // 10-60ms
          uptime: (99.5 + Math.random() * 0.5).toFixed(1) + '%'
        },
        email: {
          status: Math.random() > 0.05 ? 'healthy' : 'warning',
          deliveryRate: Math.round((97 + Math.random() * 2) * 10) / 10, // 97-99%
          bounceRate: Math.round(Math.random() * 2 * 10) / 10 // 0-2%
        },
        realtime: {
          status: 'active',
          connections: Math.floor(Math.random() * 10 + 5), // 5-15 connections
          messagesSent: Math.floor(Math.random() * 100 + 50) // 50-150 messages
        },
        api: {
          status: Math.random() > 0.05 ? 'healthy' : 'degraded',
          responseTime: Math.round(Math.random() * 200 + 50), // 50-250ms
          errorRate: Math.round(Math.random() * 1 * 100) / 100 // 0-1%
        }
      })
      setLastUpdated(new Date())
    }

    updateHealth()
    const interval = setInterval(updateHealth, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': return 'text-green-600'
      case 'warning': case 'degraded': return 'text-yellow-600'
      case 'error': case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': return '🟢'
      case 'warning': case 'degraded': return '🟡'
      case 'error': case 'down': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="mr-2">🏥</span>
          System Health
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Database Health */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(healthData.database.status)}</span>
            <div>
              <p className="font-medium text-gray-900">Database</p>
              <p className="text-sm text-gray-600">Latency: {healthData.database.latency}ms</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getStatusColor(healthData.database.status)}`}>
              {healthData.database.status}
            </p>
            <p className="text-sm text-gray-600">{healthData.database.uptime}</p>
          </div>
        </div>

        {/* Email Service Health */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(healthData.email.status)}</span>
            <div>
              <p className="font-medium text-gray-900">Email Service</p>
              <p className="text-sm text-gray-600">Delivery: {healthData.email.deliveryRate}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getStatusColor(healthData.email.status)}`}>
              {healthData.email.status}
            </p>
            <p className="text-sm text-gray-600">Bounce: {healthData.email.bounceRate}%</p>
          </div>
        </div>

        {/* Real-time Updates */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(healthData.realtime.status)}</span>
            <div>
              <p className="font-medium text-gray-900">Real-time Updates</p>
              <p className="text-sm text-gray-600">{healthData.realtime.connections} connections</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getStatusColor(healthData.realtime.status)}`}>
              {healthData.realtime.status}
            </p>
            <p className="text-sm text-gray-600">{healthData.realtime.messagesSent} msgs</p>
          </div>
        </div>

        {/* API Health */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{getStatusIcon(healthData.api.status)}</span>
            <div>
              <p className="font-medium text-gray-900">API Endpoints</p>
              <p className="text-sm text-gray-600">Response: {healthData.api.responseTime}ms</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${getStatusColor(healthData.api.status)}`}>
              {healthData.api.status}
            </p>
            <p className="text-sm text-gray-600">Error: {healthData.api.errorRate}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
