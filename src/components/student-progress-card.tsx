"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ChartBarDefault } from "./chart-bar"
import { Dot, SquareCheckBig, Star, TrendingUp, Award, BookOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SubjectData {
  name: string
  score: number
  grade: string
  status: 'pass' | 'fail'
  attendance?: number
  assignments?: number
}

interface StudentProgressCardProps {
  overallScore?: number
  subjectData?: SubjectData[]
  className?: string
}

export function StudentProgressCard({
  overallScore = 8,
  subjectData = [
    { name: "Mathematics", score: 85, grade: "A", status: "pass", attendance: 95, assignments: 18 },
    { name: "English", score: 78, grade: "B+", status: "pass", attendance: 92, assignments: 15 },
    { name: "Science", score: 82, grade: "A-", status: "pass", attendance: 88, assignments: 16 },
    { name: "Social Studies", score: 75, grade: "B", status: "pass", attendance: 90, assignments: 14 },
    { name: "Art", score: 88, grade: "A", status: "pass", attendance: 85, assignments: 12 },
    { name: "Music", score: 80, grade: "B+", status: "pass", attendance: 87, assignments: 10 }
  ],
  className = ""
}: StudentProgressCardProps) {
  const getStatusColor = (status: string) => {
    return status === 'pass' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className={`font-sans @container/card border-0 shadow-none bg-gradient-to-br from-zinc-50 to-zinc-100 hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardHeader className="pb-1">
        <ChartBarDefault data={subjectData} title="Subject Performance" />
      </CardHeader>

      <CardContent className="px-6 pb-1">
        <div className="flex-row flex w-full justify-between items-center gap-4 mb-4">
          <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
            <SquareCheckBig className="size-6" />
            Academic Progress
          </div>
          <div className="line-clamp-1 text-lg text-primary flex items-center gap-2 font-semibold">
            <Star fill="orange" className="size-5 text-orange-400" />
            <span className="font-bold">{overallScore}/10</span>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-2 p-2 bg-white/50 rounded-lg">
              <div className="flex items-center gap-1">
                <TrendingUp className="size-3 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                  <p className="text-xs font-semibold text-green-600">
                    {Math.round(subjectData.reduce((acc, subject) => acc + subject.score, 0) / subjectData.length)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Award className="size-3 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Best Subject</p>
                  <p className="text-xs font-semibold text-blue-600">
                    {subjectData.reduce((best, current) =>
                      current.score > best.score ? current : best
                    ).name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator orientation="horizontal" className="mb-1 bg-foreground/20" />
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <div className="flex flex-col gap-4 w-full">
          <div className="space-y-2">
            {subjectData.map((subject: SubjectData, index: number) => (
              <div
                key={index}
                className={`group flex items-center justify-between p-2 bg-white/70 rounded-lg border transition-all duration-200 hover:bg-white hover:shadow-sm w-full ${
                  subject.status === 'pass' ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${subject.status === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-gray-800 truncate">{subject.name}</p>
                      <Badge
                        variant="secondary"
                        className={`text-xs px-1.5 py-0.5 ${getStatusColor(subject.status)}`}
                      >
                        {subject.grade}
                      </Badge>
                      {subject.attendance && (
                        <span className="text-xs text-muted-foreground">
                          • {subject.attendance}% att.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-2">
                  <div className="text-right min-w-0">
                    <p className={`text-xs font-semibold ${getScoreColor(subject.score)}`}>
                      {subject.score}%
                    </p>
                  </div>
                  <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getScoreColor(subject.score).replace('text-', 'bg-')}`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Academic Insights */}
          <div className={`mt-4 p-3 rounded-lg border ${
            subjectData.every(subject => subject.status === 'pass') ? 'bg-green-50/50 border-green-200/30' : 'bg-blue-50/50 border-blue-200/30'
          }`}>
            <p className={`text-xs font-medium mb-1 ${
              subjectData.every(subject => subject.status === 'pass') ? 'text-green-800' : 'text-blue-800'
            }`}>
              📚 Academic Insight
            </p>
            <p className={`text-xs ${
              subjectData.every(subject => subject.status === 'pass') ? 'text-green-700' : 'text-blue-700'
            }`}>
              {subjectData.every(subject => subject.status === 'pass')
                ? 'Outstanding performance across all subjects! Keep up the excellent work.'
                : 'Good progress in most subjects. Focus on areas needing improvement for better overall results.'
              }
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
