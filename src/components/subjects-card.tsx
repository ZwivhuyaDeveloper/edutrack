import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Book, AlertCircle, GraduationCap, Users, Sparkles, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SubjectsCardProps {
  totalSubjects: number;
  activeSubjects?: number;
  subjectsByDepartment?: Array<{ department: string; count: number }>;
  recentSubjects?: Array<{ id: string; name: string; code?: string; department?: string; teacherCount: number }>;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function SubjectsCard({ 
  totalSubjects,
  activeSubjects,
  subjectsByDepartment,
  recentSubjects,
  isLoading = false,
  error = null,
  onRetry
}: SubjectsCardProps) {
  const hasSummaryDetails = typeof activeSubjects === 'number'

  // Loading state
  if (isLoading) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-purple-50/30 overflow-hidden relative">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/20 to-transparent animate-shimmer" />
        
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 relative z-10">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm">
              <Book strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-primary">Subjects</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4 relative z-10">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4">
            {/* Pulsing icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <Book className="h-10 w-10 text-primary animate-pulse" strokeWidth={2} />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                <p className="text-sm font-semibold text-foreground">Loading subjects data</p>
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Subjects:</span>
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
            <CardTitle className="text-sm sm:text-base font-bold text-red-900">Subjects</CardTitle>
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
                <p className="text-sm font-semibold text-red-900">Failed to load subjects</p>
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Subjects:</span>
            <span className="text-lg font-bold text-muted-foreground/40">---</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Data unavailable</p>
        </CardFooter>
      </Card>
    );
  }

  // Empty state (0 subjects)
  if (totalSubjects === 0) {
    return (
      <Card className="shadow-sm border-none rounded-2xl bg-gradient-to-br from-white to-slate-50/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex flex-row items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-100">
              <Book strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
            </div>
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">Subjects</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6 pb-4">
          <div className="h-[180px] flex flex-col items-center justify-center gap-4 text-center">
            {/* Empty state illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-200/50 rounded-full blur-2xl" />
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border-2 border-dashed border-slate-300">
                <Book className="h-10 w-10 text-slate-400" strokeWidth={2} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">No subjects yet</p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Start by adding subjects to your curriculum
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
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Total Subjects:</span>
            <span className="text-2xl font-bold text-slate-900">0</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-1">Ready to add subjects</p>
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
            <Book strokeWidth={2.5} className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <CardTitle className="text-sm sm:text-base font-bold text-primary">Subjects</CardTitle>
        </div>
        {totalSubjects > 0 && (
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
              {totalSubjects}
            </div>
            {typeof activeSubjects === 'number' && activeSubjects !== totalSubjects && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span>{activeSubjects} active</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total subjects in curriculum</p>
        </div>

        {/* Stats grid */}
        {(hasSummaryDetails || (subjectsByDepartment?.length ?? 0) > 0 || (recentSubjects?.length ?? 0) > 0) && (
          <div className="space-y-4">
            {/* Quick stats */}
            {typeof activeSubjects === 'number' && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-md bg-emerald-200/50">
                    <GraduationCap className="h-3 w-3 text-emerald-700" strokeWidth={2.5} />
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-900 uppercase tracking-wide">Active Subjects</p>
                </div>
                <p className="text-xl font-bold text-emerald-900">{activeSubjects}</p>
              </div>
            )}

            {/* Department distribution */}
            {subjectsByDepartment && subjectsByDepartment.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">By Department</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {subjectsByDepartment.slice(0, 4).map((item, idx) => (
                    <div 
                      key={item.department} 
                      className="flex items-center justify-between p-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 transition-all duration-200"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="text-xs font-medium text-slate-700 truncate">{item.department}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent subjects */}
            {recentSubjects && recentSubjects.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Recent</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
                <div className="space-y-1.5">
                  {recentSubjects.slice(0, 3).map((subject, idx) => (
                    <div 
                      key={subject.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group/item"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="p-1 rounded-md bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                          <Book className="h-3 w-3 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {subject.name}
                          </span>
                          {subject.code && (
                            <span className="text-[10px] text-muted-foreground">{subject.code}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 group-hover/item:bg-primary/10 transition-colors">
                        <Users className="h-3 w-3 text-slate-600" strokeWidth={2} />
                        <span className="text-xs font-semibold text-slate-700">{subject.teacherCount}</span>
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
              <span className="text-2xl font-bold text-primary">{totalSubjects}</span>
              <span className="text-xs font-medium text-muted-foreground">subjects</span>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-primary/10">
            <Book className="h-5 w-5 text-primary" strokeWidth={2} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
