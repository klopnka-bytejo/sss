'use client'

import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400',
  info: 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400',
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const Icon = icons[type]

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]}`}>
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold text-sm">{title}</p>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([])

  // Expose global toast function
  useEffect(() => {
    ;(window as any).showToast = (type: ToastType, title: string, message?: string, duration?: number) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { id, type, title, message, duration, onClose: () => {} }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration || 5000)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
        />
      ))}
    </div>
  )
}
