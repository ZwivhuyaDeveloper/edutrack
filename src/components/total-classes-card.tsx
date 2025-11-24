import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { BookOpen, AlertCircle, TrendingUp, Users, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface TotalClassesCardProps {
  totalClasses: number;
  activeClasses?: number;
  averageStudentsPerClass?: number;
  gradeDistribution?: Array<{ grade: string; count: number }>;
  recentClasses?: Array<{ id: string; name: string; grade: string | null; section: string | null; createdAt: string; activeStudents: number }>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TotalClassesCard({ 
  totalClasses, 
  activeClasses,
  averageStudentsPerClass,
  gradeDistribution,
  recentClasses,
  isLoading = false,
  error = null,
  onRetry
}: TotalClassesCardProps) {
  const hasSummaryDetails = typeof activeClasses === 'number' || typeof averageStudentsPerClass === 'number'

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-blue-50/30 overflow-hidden relative">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/20 to-transparent animate-shimmer" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <BookOpen strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-primary">Total Classes</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Loading state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 backdrop-blur-sm">
                <BookOpen className="h-10 w-10 text-primary animate-pulse" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading classes data</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
              <p className="text-xs text-muted-foreground max-w-[220px]">Fetching latest information...</p>
            </div>
            
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.2s]" />
              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-blue-50/30 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Classes:</span>
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
            <CardTitle className="text-sm sm:text-base font-bold text-red-900">Total Classes</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Error state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 border-2 border-dashed border-red-300">
                <AlertCircle className="h-10 w-10 text-red-600" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-900">Failed to load classes</p>
              <p className="text-xs text-red-700/70 max-w-[220px]">{error}</p>
            </div>
            
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-red-300" />
            </div>
            
            {/* Retry button */}
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-2 h-9 text-sm font-medium border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300 transition-all duration-200"
              >
                <RotateCw className="mr-2 h-4 w-4" /> 
                Retry Loading
              </Button>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-red-50/30">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Classes:</span>
            <span className="text-2xl font-bold text-slate-900">---</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
        </CardFooter>
      </Card>
    );
  }

  // Empty state (0 classes)
  if (totalClasses === 0) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100">
              <BookOpen strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Total Classes</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Empty state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <BookOpen className="h-10 w-10 text-slate-400" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">No classes yet</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Start by creating your first class to organize students
              </p>
            </div>
            
            {/* Decorative dots */}
            <div className="flex gap-1.5 mt-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/50">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Classes:</span>
            <span className="text-2xl font-bold text-slate-900">0</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Ready to add classes</p>
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
            <BookOpen strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-primary">Total Classes</CardTitle>
        </div>
        {totalClasses > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            <span className="text-xs font-semibold">Active</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4">
        {/* Main stat with gradient */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl hidden sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {totalClasses}
            </div>
            {typeof activeClasses === 'number' && activeClasses !== totalClasses && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span>{activeClasses} active</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total classes in system</p>
        </div>

        {/* Stats grid */}
        {(hasSummaryDetails || (gradeDistribution?.length ?? 0) > 0 || (recentClasses?.length ?? 0) > 0) && (
          <div className="space-y-4">
            {/* Quick stats */}
            {hasSummaryDetails && (
              <div className="grid grid-cols-2 hidden gap-2">
                {typeof activeClasses === 'number' && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-md bg-blue-200/50">
                        <BookOpen className="h-3 w-3 text-blue-700" strokeWidth={2.5} />
                      </div>
                      <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide">Active</p>
                    </div>
                    <p className="text-xl font-bold text-blue-900">{activeClasses}</p>
                  </div>
                )}
                {typeof averageStudentsPerClass === 'number' && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 rounded-md bg-purple-200/50">
                        <Users className="h-3 w-3 text-purple-700" strokeWidth={2.5} />
                      </div>
                      <p className="text-[10px] font-semibold text-purple-900 uppercase tracking-wide">Avg Size</p>
                    </div>
                    <p className="text-xl font-bold text-purple-900">{averageStudentsPerClass}</p>
                  </div>
                )}
              </div>
            )}

            {/* Grade distribution */}
            {gradeDistribution && gradeDistribution.length > 0 && (
              <div className="space-y-2 hidden">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">By Grade</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {gradeDistribution.slice(0, 4).map((item, idx) => (
                    <div 
                      key={item.grade} 
                      className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 transition-all duration-200"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="text-xs font-medium text-slate-700">{item.grade}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent classes */}
            {recentClasses && recentClasses.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Recent</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {recentClasses.slice(0, 3).map((cls, idx) => (
                    <div 
                      key={cls.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                          <BookOpen className="h-3 w-3 text-primary" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs font-medium text-slate-900 truncate">
                          {cls.name}{cls.section ? ` (${cls.section})` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 group-hover/item:bg-primary/10 transition-colors">
                        <Users className="h-3 w-3 text-slate-600" strokeWidth={2} />
                        <span className="text-xs font-semibold text-slate-700">{cls.activeStudents}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t bg-slate-50/30">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">System Total</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-primary">{totalClasses}</span>
              <span className="text-xs font-medium text-muted-foreground">classes</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
