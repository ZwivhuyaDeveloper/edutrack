import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Award, AlertCircle, TrendingUp, TrendingDown, Star, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AverageGradeCardProps {
  averageGrade: number;
  highestGrade?: number;
  lowestGrade?: number;
  gradeDistribution?: Array<{ range: string; count: number; percentage: number }>;
  topPerformers?: Array<{ id: string; name: string; grade: number; subject: string }>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AverageGradeCard({ 
  averageGrade,
  highestGrade,
  lowestGrade,
  gradeDistribution,
  topPerformers,
  isLoading = false,
  error = null,
  onRetry
}: AverageGradeCardProps) {
  const hasSummaryDetails = typeof highestGrade === 'number' || typeof lowestGrade === 'number'
  
  // Helper to get grade color
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600'
    if (grade >= 80) return 'text-blue-600'
    if (grade >= 70) return 'text-yellow-600'
    if (grade >= 60) return 'text-orange-600'
    return 'text-red-600'
  }

  // Helper to get grade badge color
  const getGradeBadgeColor = (grade: number) => {
    if (grade >= 90) return 'bg-green-100 text-green-700 border-green-200'
    if (grade >= 80) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (grade >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    if (grade >= 60) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-yellow-50/30 overflow-hidden relative">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-100/20 to-transparent animate-shimmer" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <Award strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-primary">Average Grade</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4">
            {/* Pulsing icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <Award className="h-10 w-10 text-primary animate-pulse" strokeWidth={2} />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading grades data</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
              <p className="text-xs text-muted-foreground">Calculating averages...</p>
            </div>
            
            {/* Skeleton stats */}
            <div className="w-full max-w-[200px] space-y-2 mt-2">
              <div className="h-3 bg-primary/10 rounded-full animate-pulse" />
              <div className="h-3 bg-primary/10 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-gradient-to-r from-primary/5 to-transparent relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Average Grade:</span>
            <div className="h-6 w-12 bg-primary/10 rounded animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Loading statistics...</p>
        </CardFooter>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-red-50/20 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-red-100">
              <AlertCircle strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-red-900">Average Grade</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="space-y-4">
            {/* Error illustration */}
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="p-4 rounded-2xl bg-red-100">
                <AlertCircle className="h-12 w-12 text-red-600" strokeWidth={2} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-red-900">Failed to load grades</p>
                <p className="text-xs text-red-700/70 max-w-[250px]">{error}</p>
              </div>
            </div>
            
            {/* Retry button */}
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="w-full h-9 text-sm font-medium border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-all duration-200"
              >
                <RotateCw className="mr-2 h-4 w-4" /> 
                Retry Loading
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-red-50/30">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Average Grade:</span>
            <span className="text-lg font-bold text-muted-foreground/40">---</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
        </CardFooter>
      </Card>
    );
  }

  // Default state
  return (
    <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white via-white to-primary/5 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex flex-row items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <Award strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-primary">Average Grade</CardTitle>
        </div>
        {averageGrade >= 80 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            <span className="text-xs font-semibold">Excellent</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4">
        {/* Main stat with gradient */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <div className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent`}>
              {averageGrade.toFixed(1)}%
            </div>
            {averageGrade >= 90 ? (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>Outstanding</span>
              </div>
            ) : averageGrade < 70 ? (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <TrendingDown className="h-3 w-3" />
                <span>Needs improvement</span>
              </div>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground mt-1">School-wide average performance</p>
        </div>

        {/* Stats grid */}
        {(hasSummaryDetails || (gradeDistribution?.length ?? 0) > 0 || (topPerformers?.length ?? 0) > 0) && (
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              {typeof highestGrade === 'number' && (
                <div className={`p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-md bg-green-200/50">
                      <TrendingUp className="h-3 w-3 text-green-700" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-semibold text-green-900 uppercase tracking-wide">Highest</p>
                  </div>
                  <p className="text-xl font-bold text-green-900">{highestGrade.toFixed(1)}%</p>
                </div>
              )}
              {typeof lowestGrade === 'number' && (
                <div className={`p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50`}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-md bg-orange-200/50">
                      <TrendingDown className="h-3 w-3 text-orange-700" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-semibold text-orange-900 uppercase tracking-wide">Lowest</p>
                  </div>
                  <p className="text-xl font-bold text-orange-900">{lowestGrade.toFixed(1)}%</p>
                </div>
              )}
            </div>

            {/* Grade distribution */}
            {gradeDistribution && gradeDistribution.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Distribution</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {gradeDistribution.map((item, idx) => (
                    <div 
                      key={item.range} 
                      className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-900">{item.range}</span>
                          <span className="text-xs font-bold text-slate-700">{item.count} students</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-primary">{item.percentage.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top performers */}
            {topPerformers && topPerformers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Top Performers</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {topPerformers.slice(0, 3).map((performer, idx) => (
                    <div 
                      key={performer.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                          <Star className="h-3 w-3 text-primary" strokeWidth={2.5} fill="currentColor" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {performer.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{performer.subject}</span>
                        </div>
                      </div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getGradeBadgeColor(performer.grade)}`}>
                        {performer.grade.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-gradient-to-r from-primary/5 via-transparent to-transparent">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">School Average</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-bold ${getGradeColor(averageGrade)}`}>{averageGrade.toFixed(1)}%</span>
              <span className="text-xs font-medium text-muted-foreground">overall</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <Award className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
