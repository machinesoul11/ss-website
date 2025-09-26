import React from 'react'
import { AdminAuth } from '../../components/admin/AdminAuth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  🔒 Silent Scribe Admin
                </h1>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Authenticated
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Dashboard</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    </AdminAuth>
  )
}
