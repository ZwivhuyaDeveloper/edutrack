"use client"
/**
 * PendingFeesCard Component
 * 
 * This component receives data via props from the parent page.
 * Data is cached at the page level with a 2-minute TTL to improve performance.
 * Fee records are cached for 2 minutes to balance freshness with performance.
 */

import { DollarSign, AlertCircle, Loader2, Receipt } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FeeRecord {
  id: string
  description: string
  amount: number
  dueDate: string
  paid: boolean
  studentId: string
  student?: {
    firstName: string
    lastName: string
  }
}

interface PendingFeesCardProps {
  feeRecords: FeeRecord[]
  totalPending: number
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onSeeAll?: () => void
}

export function PendingFeesCard({ 
  feeRecords, 
  totalPending,
  isLoading = false,
  error = null,
  onRetry,
  onSeeAll
}: PendingFeesCardProps) {
  // Calculate total from actual fee records being displayed
  const calculatedTotal = feeRecords.reduce((sum, record) => sum + record.amount, 0)
  
  // Use calculated total if available, otherwise fall back to totalPending prop
  const displayTotal = feeRecords.length > 0 ? calculatedTotal : totalPending

  // Enhanced Loading State
  if (isLoading) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <DollarSign strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Pending Fees</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            Transactions
          </Button>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading fee records...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch pending fees</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Pending: <span className="text-primary/50">$---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Outstanding amount
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Error State
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <DollarSign strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Pending Fees</CardTitle>
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="border-primary text-xs h-7 px-2 sm:px-3"
            onClick={onSeeAll}
          >
            Transactions
          </Button>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex items-center justify-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <p className="font-medium">Failed to load fee records</p>
                <p className="text-xs mt-1">{error}</p>
                {onRetry && (
                  <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                  >
                    Try Again
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Pending: <span className="text-primary/50">$---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Data unavailable
          </p>
        </CardFooter>
      </Card>
    )
  }

  // Enhanced Empty State
  if (!feeRecords || feeRecords.length === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full ">
        <CardHeader className="flex flex-col  justify-between items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-row items-center justify-start gap-2 pl-4 py-1 sm:py-1">
            <DollarSign strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-md font-semibold text-primary">Pending Fees</CardTitle>
          </div>
          <div className="flex flex-row w-fit pr-4 items-center justify-end">
            <Button 
              variant="default" 
              size="sm" 
              className="border-primary hidden w-fit text-xs h-7 px-2 sm:px-3"
              onClick={onSeeAll}
          >
            Transactions
          </Button>
          </div>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No pending fees</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                All fees have been paid or no fees are currently due
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold">
            Total Pending: <span className="text-primary">$0.00</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            All fees cleared
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-none pt-0 gap-3 ">
      <CardHeader className="flex flex-row items-center border-b border-zinc-200 justify-between space-y-0 px-6 pt-6">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2 w-full h-full border-r border-zinc-200">
          <DollarSign strokeWidth={2} className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
          <CardTitle className="text-md sm:text-md font-bold text-primary">Pending Fees</CardTitle>
        </div>
        <Button 
          variant="default" 
          size="sm" 
          className="border-primary text-xs h-7 px-2 sm:px-3"
          onClick={onSeeAll}
        >
          Transactions
        </Button>
      </CardHeader>
      <CardContent className="sm:px-6 h-fit flex flex-col">
        {/* Fee Records List */}
        <div className="space-y-2">
          {feeRecords.slice(0, 3).map((record) => (
            <div 
              key={record.id} 
              className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-zinc-200/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {record.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(record.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-primary">
                  ${record.amount.toFixed(2)}
                </p>
                <Badge variant="default" className="text-xs px-2 py-0 h-5 mt-1">
                  Unpaid
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

        <CardFooter className="flex flex-col items-start px-6 mt-5">
          <div className="text-lg sm:text-lg font-bold">
            Total Pending: <span className="text-primary">${displayTotal.toFixed(2)}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Outstanding amount
          </p>
        </CardFooter>

    </Card>
  )
}
