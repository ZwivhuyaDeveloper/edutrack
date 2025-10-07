import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE' | 'OTHER'

interface Payment {
  id: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
  receivedAt: Date | string
  processedBy?: {
    firstName: string
    lastName: string
  }
}

interface PaymentHistoryTableProps {
  payments: Payment[]
  title?: string
  description?: string
  showTotal?: boolean
  className?: string
}

const paymentMethodConfig = {
  CASH: { label: 'Cash', color: 'bg-green-100 text-green-800' },
  CARD: { label: 'Card', color: 'bg-blue-100 text-blue-800' },
  BANK_TRANSFER: { label: 'Bank Transfer', color: 'bg-purple-100 text-purple-800' },
  CHEQUE: { label: 'Cheque', color: 'bg-orange-100 text-orange-800' },
  ONLINE: { label: 'Online', color: 'bg-indigo-100 text-indigo-800' },
  OTHER: { label: 'Other', color: 'bg-gray-100 text-gray-800' }
}

export function PaymentHistoryTable({
  payments,
  title = 'Payment History',
  description = 'All your payment transactions',
  showTotal = true,
  className
}: PaymentHistoryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {showTotal && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => {
              const receivedAt = typeof payment.receivedAt === 'string' 
                ? new Date(payment.receivedAt) 
                : payment.receivedAt
              const methodConfig = paymentMethodConfig[payment.method]

              return (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(receivedAt, 'MMM d, yyyy • h:mm a')}
                      </p>
                      {payment.reference && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ref: {payment.reference}
                        </p>
                      )}
                      {payment.notes && (
                        <p className="text-xs text-gray-600 mt-1">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={methodConfig.color} variant="secondary">
                      {methodConfig.label}
                    </Badge>
                    {payment.processedBy && (
                      <p className="text-xs text-gray-500">
                        By: {payment.processedBy.firstName} {payment.processedBy.lastName}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments</h3>
            <p className="text-gray-600">You haven&apos;t made any payments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
