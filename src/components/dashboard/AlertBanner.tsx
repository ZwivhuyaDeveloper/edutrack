import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

type AlertType = 'info' | 'warning' | 'error' | 'success'

interface AlertBannerProps {
  type?: AlertType
  title: string
  message: string
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const alertConfig = {
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-900',
    iconClassName: 'text-blue-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-orange-200 bg-orange-50 text-orange-900',
    iconClassName: 'text-orange-600'
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClassName: 'text-red-600'
  },
  success: {
    icon: CheckCircle2,
    className: 'border-green-200 bg-green-50 text-green-900',
    iconClassName: 'text-green-600'
  }
}

export function AlertBanner({
  type = 'info',
  title,
  message,
  dismissible = false,
  action,
  className
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible) return null

  const config = alertConfig[type]
  const Icon = config.icon

  return (
    <Alert className={cn(config.className, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5", config.iconClassName)} />
        <div className="flex-1">
          <AlertTitle className="font-semibold mb-1">{title}</AlertTitle>
          <AlertDescription className="text-sm">{message}</AlertDescription>
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="mt-3"
            >
              {action.label}
            </Button>
          )}
        </div>
        {dismissible && (
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  )
}
