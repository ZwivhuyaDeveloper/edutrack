"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  TrendingUp,
  Wallet
} from 'lucide-react'
import { format } from 'date-fns'

interface StudentAccount {
  id: string
  balance: number
  invoices: Invoice[]
  payments: Payment[]
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  dueDate: string
  total: number
  notes: string | null
  createdAt: string
  items: InvoiceItem[]
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Payment {
  id: string
  amount: number
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'ONLINE' | 'OTHER'
  reference: string | null
  notes: string | null
  receivedAt: string
  processedBy: {
    firstName: string
    lastName: string
  } | null
}

interface FeeRecord {
  id: string
  description: string
  amount: number
  dueDate: string
  paid: boolean
  paidAt: string | null
  createdAt: string
}

export default function FinancePage() {
  const [account, setAccount] = useState<StudentAccount | null>(null)
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFinancialData() {
      try {
        const [accountRes, feesRes] = await Promise.all([
          fetch('/api/dashboard/student/account'),
          fetch('/api/dashboard/student/fees')
        ])

        if (accountRes.ok) {
          const accountData = await accountRes.json()
          setAccount(accountData)
        }

        if (feesRes.ok) {
          const feesData = await feesRes.json()
          setFeeRecords(feesData)
        }
      } catch (error) {
        console.error('Error fetching financial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  const getStatusConfig = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return { 
          icon: CheckCircle2, 
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Paid'
        }
      case 'PENDING':
        return { 
          icon: Clock, 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pending'
        }
      case 'OVERDUE':
        return { 
          icon: AlertCircle, 
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Overdue'
        }
      case 'CANCELLED':
        return { 
          icon: AlertCircle, 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Cancelled'
        }
      case 'REFUNDED':
        return { 
          icon: CheckCircle2, 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Refunded'
        }
    }
  }

  const getPaymentMethodLabel = (method: Payment['method']) => {
    switch (method) {
      case 'CASH': return 'Cash'
      case 'CARD': return 'Card'
      case 'BANK_TRANSFER': return 'Bank Transfer'
      case 'CHEQUE': return 'Cheque'
      case 'ONLINE': return 'Online'
      default: return 'Other'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const outstandingFees = feeRecords.filter(fee => !fee.paid)
  const totalOutstanding = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Finance & Fees</h1>
        <p className="text-gray-600 mt-1">Manage your account, invoices, and payments</p>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Balance</p>
                <p className={`text-2xl font-bold ${
                  (account?.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(account?.balance || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding Fees</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalOutstanding)}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {account?.payments.length || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices ({account?.invoices.length || 0})</TabsTrigger>
          <TabsTrigger value="payments">Payment History ({account?.payments.length || 0})</TabsTrigger>
          <TabsTrigger value="fees">Fee Records ({feeRecords.length})</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4 mt-6">
          {account?.invoices.map((invoice) => {
            const statusConfig = getStatusConfig(invoice.status)
            const StatusIcon = statusConfig.icon

            return (
              <Card key={invoice.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Invoice #{invoice.invoiceNumber}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge className={`${statusConfig.color} border mb-2`} variant="secondary">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Invoice Items */}
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
                        {invoice.items.map((item) => (
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
                            {formatCurrency(invoice.total)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {invoice.notes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Note:</span> {invoice.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Created: {format(new Date(invoice.createdAt), 'MMM d, yyyy')}
                    </p>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {(!account?.invoices || account.invoices.length === 0) && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices</h3>
              <p className="text-gray-600">You don&apos;t have any invoices yet</p>
            </div>
          )}
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment History
              </CardTitle>
              <CardDescription>All your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {account?.payments.map((payment) => (
                  <div 
                    key={payment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
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
                          {format(new Date(payment.receivedAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                        {payment.reference && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ref: {payment.reference}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {getPaymentMethodLabel(payment.method)}
                      </Badge>
                      {payment.processedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          By: {payment.processedBy.firstName} {payment.processedBy.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(!account?.payments || account.payments.length === 0) && (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments</h3>
                  <p className="text-gray-600">You haven&apos;t made any payments yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Records Tab */}
        <TabsContent value="fees" className="space-y-4 mt-6">
          {/* Outstanding Fees */}
          {outstandingFees.length > 0 && (
            <Card className="border-orange-300 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertCircle className="h-5 w-5" />
                  Outstanding Fees
                </CardTitle>
                <CardDescription>Fees that require payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outstandingFees.map((fee) => (
                    <div 
                      key={fee.id}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{fee.description}</p>
                        <p className="text-sm text-gray-600">
                          Due: {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-900">
                          {formatCurrency(fee.amount)}
                        </p>
                        <Badge variant="destructive" className="mt-1">
                          Unpaid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Fee Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                All Fee Records
              </CardTitle>
              <CardDescription>Complete fee history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {feeRecords.map((fee) => (
                  <div 
                    key={fee.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        fee.paid ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {fee.paid ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fee.description}</p>
                        <p className="text-sm text-gray-600">
                          Due: {format(new Date(fee.dueDate), 'MMM d, yyyy')}
                        </p>
                        {fee.paid && fee.paidAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Paid on {format(new Date(fee.paidAt), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(fee.amount)}
                      </p>
                      <Badge variant={fee.paid ? 'default' : 'secondary'} className="mt-1">
                        {fee.paid ? 'Paid' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {feeRecords.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No fee records</h3>
                  <p className="text-gray-600">You don&apos;t have any fee records yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
