"use client"

import { DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
  onSeeAll?: () => void
}

export function PendingFeesCard({ 
  feeRecords, 
  totalPending,
  isLoading = false,
  onSeeAll
}: PendingFeesCardProps) {
  // Calculate total from actual fee records being displayed
  const calculatedTotal = feeRecords.reduce((sum, record) => sum + record.amount, 0)
  
  // Use calculated total if available, otherwise fall back to totalPending prop
  const displayTotal = feeRecords.length > 0 ? calculatedTotal : totalPending

  return (
    <Card className="border-none shadow-none pt-0 ">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pt-6">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
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
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading fee records...</div>
          ) : feeRecords.length > 0 ? (
            feeRecords.slice(0, 3).map((record) => (
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
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No pending fees</div>
          )}
        </div>
      </CardContent>

        <CardFooter className="flex flex-col items-start px-6 mt-5">
          <div className="text-lg sm:text-xl font-bold">
            Total Pending: <span className="text-primary">${displayTotal.toFixed(2)}</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Outstanding amount
          </p>
        </CardFooter>

    </Card>
  )
}
