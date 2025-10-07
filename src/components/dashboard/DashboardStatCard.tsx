import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-primary',
  iconBgColor = 'bg-primary/10',
  trend,
  description
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
            iconBgColor
          )}>
            <Icon className={cn("h-6 w-6", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
