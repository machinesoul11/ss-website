'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto remove toast after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemoveToast: (id: string) => void
}

function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div
      className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none"
      style={{ maxWidth: '420px' }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
  }

  const Icon = icons[toast.type]

  const handleRemove = () => {
    onRemove(toast.id)
  }

  const handleAction = () => {
    toast.action?.onClick()
    handleRemove()
  }

  return (
    <Transition
      show={true}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={cn(
          'max-w-sm w-full bg-parchment-white shadow-hover-card rounded-card pointer-events-auto ring-1 ring-border-gray overflow-hidden',
          'transform transition-all duration-300 ease-in-out'
        )}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon
                className={cn('h-6 w-6', {
                  'text-suggestion-green': toast.type === 'success',
                  'text-error-crimson': toast.type === 'error',
                  'text-warning-amber': toast.type === 'warning',
                  'text-quill-blue': toast.type === 'info',
                })}
              />
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-ui-label font-medium text-text-gray">
                {toast.title}
              </p>
              {toast.message && (
                <p className="mt-1 text-body text-muted-gray">
                  {toast.message}
                </p>
              )}
              {toast.action && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="text-ui-label font-medium text-quill-blue hover:text-blue-700 focus:outline-none focus:underline"
                    onClick={handleAction}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>
            <div className="ml-4 flex flex-shrink-0">
              <button
                type="button"
                className="inline-flex text-muted-gray hover:text-text-gray focus:outline-none focus:ring-2 focus:ring-focus-purple rounded-md"
                onClick={handleRemove}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
    addToast({ type: 'success', title, message, ...options })
}

export function useErrorToast() {
  const { addToast } = useToast()
  return (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
    addToast({ type: 'error', title, message, ...options })
}

export function useWarningToast() {
  const { addToast } = useToast()
  return (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
    addToast({ type: 'warning', title, message, ...options })
}

export function useInfoToast() {
  const { addToast } = useToast()
  return (title: string, message?: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'title' | 'message'>>) =>
    addToast({ type: 'info', title, message, ...options })
}
