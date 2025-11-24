import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { FileText, AlertCircle, Clock, CheckCircle, AlertTriangle, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AssignmentsCardProps {
  totalAssignments: number;
  pendingAssignments?: number;
  overdueAssignments?: number;
  upcomingAssignments?: Array<{ id: string; title: string; dueDate: string; subject: string; submissionCount: number }>;
  recentAssignments?: Array<{ id: string; title: string; dueDate: string; subject: string; submissionCount: number }>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AssignmentsCard({ 
  totalAssignments,
  pendingAssignments,
  overdueAssignments,
  upcomingAssignments,
  recentAssignments,
  isLoading = false,
  error = null,
  onRetry
}: AssignmentsCardProps) {
  const hasSummaryDetails = typeof pendingAssignments === 'number' || typeof overdueAssignments === 'number'

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-amber-50/30 overflow-hidden relative">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/20 to-transparent animate-shimmer" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <FileText strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-primary">Assignments</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4">
            {/* Pulsing icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <FileText className="h-10 w-10 text-primary animate-pulse" strokeWidth={2} />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading assignments data</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              </div>
              <p className="text-xs text-muted-foreground">Fetching latest information...</p>
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Assignments:</span>
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
            <CardTitle className="text-sm sm:text-base font-bold text-red-900">Assignments</CardTitle>
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
                <p className="text-sm font-semibold text-red-900">Failed to load assignments</p>
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Assignments:</span>
            <span className="text-lg font-bold text-muted-foreground/40">---</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
        </CardFooter>
      </Card>
    );
  }

  // Empty state (0 assignments)
  if (totalAssignments === 0) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100">
              <FileText strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Assignments</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Empty state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <FileText className="h-10 w-10 text-slate-400" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">No assignments yet</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Start by creating assignments for your classes
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Assignments:</span>
            <span className="text-2xl font-bold text-slate-900">0</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Ready to add assignments</p>
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
            <FileText strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-primary">Assignments</CardTitle>
        </div>
        {totalAssignments > 0 && (
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
            <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {totalAssignments}
            </div>
            {typeof overdueAssignments === 'number' && overdueAssignments > 0 && (
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{overdueAssignments} overdue</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total assignments created</p>
        </div>

        {/* Stats grid */}
        {(hasSummaryDetails || (upcomingAssignments?.length ?? 0) > 0 || (recentAssignments?.length ?? 0) > 0) && (
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2">
              {typeof pendingAssignments === 'number' && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-md bg-blue-200/50">
                      <Clock className="h-3 w-3 text-blue-700" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-semibold text-blue-900 uppercase tracking-wide">Pending</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">{pendingAssignments}</p>
                </div>
              )}
              {typeof overdueAssignments === 'number' && (
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-md bg-red-200/50">
                      <AlertTriangle className="h-3 w-3 text-red-700" strokeWidth={2.5} />
                    </div>
                    <p className="text-[10px] font-semibold text-red-900 uppercase tracking-wide">Overdue</p>
                  </div>
                  <p className="text-xl font-bold text-red-900">{overdueAssignments}</p>
                </div>
              )}
            </div>

            {/* Upcoming assignments */}
            {upcomingAssignments && upcomingAssignments.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Upcoming</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {upcomingAssignments.slice(0, 3).map((assignment, idx) => (
                    <div 
                      key={assignment.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                          <FileText className="h-3 w-3 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {assignment.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{assignment.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 group-hover/item:bg-primary/10 transition-colors">
                        <CheckCircle className="h-3 w-3 text-slate-600" strokeWidth={2} />
                        <span className="text-xs font-semibold text-slate-700">{assignment.submissionCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent assignments */}
            {recentAssignments && recentAssignments.length > 0 && !upcomingAssignments && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Recent</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {recentAssignments.slice(0, 3).map((assignment, idx) => (
                    <div 
                      key={assignment.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                          <FileText className="h-3 w-3 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {assignment.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{assignment.subject}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 group-hover/item:bg-primary/10 transition-colors">
                        <CheckCircle className="h-3 w-3 text-slate-600" strokeWidth={2} />
                        <span className="text-xs font-semibold text-slate-700">{assignment.submissionCount}</span>
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
            <p className="text-xs text-muted-foreground">System Total</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-primary">{totalAssignments}</span>
              <span className="text-xs font-medium text-muted-foreground">assignments</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
