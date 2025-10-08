import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface InvoiceSummaryProps {
  invoiceNumber: string
  status: InvoiceStatus
  dueDate: Date | string
  total: number
  items: InvoiceItem[]
  notes?: string
  createdAt: Date | string
  onDownload?: () => void
  className?: string
}

const statusConfig = {
  PAID: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-200',
    label: 'Paid'
  },
  PENDING: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    label: 'Pending'
  },
  OVERDUE: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    label: 'Overdue'
  },
  CANCELLED: {
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    label: 'Cancelled'
  },
  REFUNDED: {
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    label: 'Refunded'
  }
}

export function InvoiceSummary({
  invoiceNumber,
  status,
  dueDate,
  total,
  items,
  notes,
  createdAt,
  onDownload,
  className
}: InvoiceSummaryProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const createdAtObj = typeof createdAt === 'string' ? new Date(createdAt) : createdAt

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card className={cn(
      status === 'OVERDUE' && 'border-red-300 border-2',
      className
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice #{invoiceNumber}
            </CardTitle>
            <CardDescription className="mt-1">
              Due: {format(dueDateObj, 'MMM d, yyyy')}
            </CardDescription>
          </div>
          <div className="text-right space-y-2">
            <Badge className={cn(config.color, "border")} variant="secondary">
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invoice Items Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-center p-3 text-sm font-semibold text-gray-700">Qty</th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">Unit Price</th>
                <th className="text-right p-3 text-sm font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3 text-sm text-gray-900">{item.description}</td>
                  <td className="p-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                  <td className="p-3 text-sm text-gray-900 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-3 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2">
              <tr>
                <td colSpan={3} className="p-3 text-sm font-semibold text-gray-900 text-right">
                  Total
                </td>
                <td className="p-3 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Notes */}
        {notes && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> {notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <p className="text-sm text-gray-600">
            Created: {format(createdAtObj, 'MMM d, yyyy')}
          </p>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
