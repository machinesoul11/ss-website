// Admin Dashboard Components
export { AdminAuth } from './AdminAuth'
export { LiveStatsCard } from './LiveStatsCard'
export { RecentActivityFeed } from './RecentActivityFeed'
export { NotificationCenter } from './NotificationCenter'
export { SystemHealthMonitor } from './SystemHealthMonitor'
export { RealTimeSignupCounter } from './RealTimeSignupCounter'

// Phase 6: Privacy Analytics Components
export { default as PrivacyAnalyticsDashboard } from './PrivacyAnalyticsDashboard'

// Phase 6: Performance Monitoring Components
export { PerformanceMonitoringDashboard } from './PerformanceMonitoringDashboard'
export { ErrorMonitoringDashboard } from './ErrorMonitoringDashboard'

// Admin component types
export interface AdminNotification {
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
  data: Record<string, unknown>
}

export interface AdminActivity {
  type: 'signup' | 'email_event' | 'feedback'
  timestamp: string
  user_email?: string
  details: string
}

export interface SystemHealth {
  database: { status: string; latency: number; uptime: string }
  email: { status: string; deliveryRate: number; bounceRate: number }
  realtime: { status: string; connections: number; messagesSent: number }
  api: { status: string; responseTime: number; errorRate: number }
}
