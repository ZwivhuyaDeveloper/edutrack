"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ChartAreaInteractive } from "./chart-area-interactive"
import { Dot, SquareCheckBig, Star, TrendingUp, Calendar, CheckCircle, XCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface TermData {
  term: string
  status: 'pass' | 'fail'
  score?: number
  subjects?: {
    name: string
    score: number
    grade: string
  }[]
}

interface TermStatusCardProps {
  overallScore?: number
  termData?: TermData[]
  className?: string
}

export function TermStatusCard({
  overallScore = 8,
  termData = [
    { term: "First Term", status: "fail", score: 65 },
    { term: "Second Term", status: "pass", score: 78 },
    { term: "Third Term", status: "pass", score: 82 },
    { term: "Fourth Term", status: "pass", score: 85 }
  ],
  className = ""
}: TermStatusCardProps) {
  const getStatusIcon = (status: string) => {
    return status === 'pass' ? (
      <CheckCircle className="size-5 text-green-600" />
    ) : (
      <XCircle className="size-5 text-red-600" />
    )
  }

  const getStatusColor = (status: string) => {
    return status === 'pass' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const passedTerms = termData.filter(term => term.status === 'pass').length
  const totalTerms = termData.length
  const passRate = Math.round((passedTerms / totalTerms) * 100)

  return (
    <Card className={`font-sans @container/card border-0 shadow-none bg-gradient-to-br from-zinc-50 to-zinc-100 hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <ChartAreaInteractive />
      </CardHeader>

      <CardContent className="px-6 pb-4">
        <div className="flex-row flex w-full justify-between items-center gap-4 mb-4">
          <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
            <SquareCheckBig className="size-6" />
            Term Status
          </div>
          <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
            <Star fill="orange" className="size-5 text-orange-400" />
            <span className="font-bold">{overallScore}/10</span>
          </div>
        </div>

        <Separator orientation="horizontal" className="mb-4 bg-foreground/20" />

        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600" />
            <div>
              <p className="text-xs text-muted-foreground">Pass Rate</p>
              <p className="text-sm font-semibold text-green-600">{passRate}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-blue-600" />
            <div>
              <p className="text-xs text-muted-foreground">Terms Completed</p>
              <p className="text-sm font-semibold text-blue-600">{totalTerms}/4</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="size-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Academic Terms</p>
          </div>

          <div className="space-y-3">
            {termData.map((term, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between p-4 bg-white/70 rounded-lg border transition-all duration-200 hover:bg-white hover:shadow-sm ${
                  term.status === 'pass' ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(term.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{term.term}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(term.status)}`}
                      >
                        {term.status === 'pass' ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-semibold ${getScoreColor(term.score || 0)}`}>
                    {term.score}%
                  </p>
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getScoreColor(term.score || 0).replace('text-', 'bg-')}`}
                      style={{ width: `${term.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Insights */}
          <div className={`mt-4 p-3 rounded-lg border ${
            passRate >= 75 ? 'bg-green-50/50 border-green-200/30' : 'bg-yellow-50/50 border-yellow-200/30'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              passRate >= 75 ? 'text-green-800' : 'text-yellow-800'
            }`}>
              📚 Academic Insight
            </p>
            <p className={`text-xs ${
              passRate >= 75 ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {passRate >= 75
                ? 'Excellent academic performance! Keep up the great work and maintain this standard.'
                : 'Good progress shown. Focus on areas needing improvement for better results.'
              }
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
