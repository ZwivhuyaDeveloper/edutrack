import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCw } from 'lucide-react';

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
      <Card className='shadow-none border-none rounded-2xl'>
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Total Classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex flex-col items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading classes...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch classes</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Classes: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Active classes
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Total Classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-2 py-1">
            <AlertDescription className="text-xs">
              {error}
            </AlertDescription>
          </Alert>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="text-xs h-7 px-2"
            >
              <RotateCw className="mr-1 h-3 w-3" /> Retry
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Total Classes: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Active classes
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Empty state (0 classes)
  if (totalClasses === 0) {
    return (
      <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Total Classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No classes</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                No classes have been added
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold">
            Total Classes: <span className="text-primary">0</span>
          </div>
          {typeof activeClasses === 'number' && (
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Active classes: {activeClasses}
            </p>
          )}
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            No classes
          </p>
        </CardFooter>
      </Card>
    );
  }

  // Default state
  return (
    <Card className="border-none shadow-none justify-between gap-5 h-full pt-0">
      <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
        <div className="flex flex-row items-center gap-1.5 sm:gap-2">
          <BookOpen strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardTitle className="text-sm sm:text-sm font-bold text-primary">Total Classes</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalClasses}</div>
        <p className="text-xs text-muted-foreground">Active classes overview</p>
        {(hasSummaryDetails || (gradeDistribution?.length ?? 0) > 0 || (recentClasses?.length ?? 0) > 0) && (
          <div className="mt-3 space-y-3 text-xs text-muted-foreground">
            <div className="space-y-1">
              {typeof activeClasses === 'number' && (
                <p>Active classes: <span className="text-foreground font-medium">{activeClasses}</span></p>
              )}
              {typeof averageStudentsPerClass === 'number' && (
                <p>Avg. students per class: <span className="text-foreground font-medium">{averageStudentsPerClass}</span></p>
              )}
            </div>

            {gradeDistribution && gradeDistribution.length > 0 && (
              <div className="space-y-1">
                <p className="text-foreground font-semibold text-[11px] uppercase tracking-tight">By grade</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {gradeDistribution.slice(0, 4).map((item) => (
                    <div key={item.grade} className="flex items-center justify-between">
                      <span>{item.grade}</span>
                      <span className="text-foreground font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recentClasses && recentClasses.length > 0 && (
              <div className="space-y-1">
                <p className="text-foreground font-semibold text-[11px] uppercase tracking-tight">Recent classes</p>
                <ul className="space-y-1">
                  {recentClasses.slice(0, 3).map((cls) => (
                    <li key={cls.id} className="flex items-center justify-between">
                      <span className="truncate">{cls.name}{cls.section ? ` (${cls.section})` : ''}</span>
                      <span className="text-muted-foreground">{cls.activeStudents}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start px-6">
        <div className="text-lg sm:text-lg font-bold">
          Total Classes: <span className="text-primary">{totalClasses}</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          Active classes
        </p>
      </CardFooter>
    </Card>
  );
}
