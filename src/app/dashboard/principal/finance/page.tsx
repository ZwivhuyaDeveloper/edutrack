"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  FileText,
  Users,
  Calendar,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface FinanceStats {
  totalRevenue: number
  outstandingFees: number
  collectedThisMonth: number
  pendingInvoices: number
  paymentRate: number
  averageFeePerStudent: number
}

interface FeeRecord {
  id: string
  description: string
  amount: number
  dueDate: string
  paid: boolean
  paidAt?: string
  student: {
    firstName: string
    lastName: string
    studentProfile: {
      studentIdNumber?: string
    }
  }
}

interface Payment {
  id: string
  amount: number
  method: string
  reference?: string
  receivedAt: string
  account: {
    student: {
      firstName: string
      lastName: string
    }
  }
}

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  dueDate: string
  total: number
  account: {
    student: {
      firstName: string
      lastName: string
    }
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}

export default function PrincipalFinancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    outstandingFees: 0,
    collectedThisMonth: 0,
    pendingInvoices: 0,
    paymentRate: 0,
    averageFeePerStudent: 0
  })
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('month')

  useEffect(() => {
    fetchData()
    fetchStats()
  }, [activeTab, dateFilter])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      let endpoint = ''
      
      switch (activeTab) {
        case 'fees':
          endpoint = '/api/principal/finance/fees'
          break
        case 'payments':
          endpoint = '/api/principal/finance/payments'
          break
        case 'invoices':
          endpoint = '/api/principal/finance/invoices'
          break
      }

      if (endpoint) {
        const response = await fetch(`${endpoint}?period=${dateFilter}`)
        if (response.ok) {
          const data = await response.json()
          
          switch (activeTab) {
            case 'fees':
              setFeeRecords(data.feeRecords || [])
              break
            case 'payments':
              setPayments(data.payments || [])
              break
            case 'invoices':
              setInvoices(data.invoices || [])
              break
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load financial data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/principal/finance/stats?period=${dateFilter}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue and collection patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Revenue chart will be displayed here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paymentRate}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageFeePerStudent}</div>
            <p className="text-xs text-muted-foreground">Per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const FeesTab = () => (
    <div className="space-y-4">
      {feeRecords.length > 0 ? (
        <div className="space-y-4">
          {feeRecords.map((fee) => (
            <Card key={fee.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">
                      {fee.student.firstName} {fee.student.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {fee.description} • Due: {new Date(fee.dueDate).toLocaleDateString()}
                    </div>
                    {fee.student.studentProfile?.studentIdNumber && (
                      <div className="text-xs text-muted-foreground">
                        ID: {fee.student.studentProfile.studentIdNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${fee.amount}</div>
                    <Badge variant={fee.paid ? 'default' : 'destructive'}>
                      {fee.paid ? 'Paid' : 'Outstanding'}
                    </Badge>
                    {fee.paid && fee.paidAt && (
                      <div className="text-xs text-muted-foreground">
                        Paid: {new Date(fee.paidAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No fee records found</h3>
            <p className="text-muted-foreground">Fee records will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground">
            Monitor school finances, fees, and payments (View Only)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats.outstandingFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unpaid amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.collectedThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentRate}%</div>
            <p className="text-xs text-muted-foreground">On-time payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Records</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {isLoading ? (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="h-64 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>
          ) : (
            <OverviewTab />
          )}
        </TabsContent>

        <TabsContent value="fees">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <FeesTab />
          )}
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Records</h3>
              <p className="text-muted-foreground">Payment history will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Invoice Management</h3>
              <p className="text-muted-foreground">Student invoices will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
