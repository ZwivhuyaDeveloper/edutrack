import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCw } from 'lucide-react';

export interface AverageGradeCardProps {
  averageGrade: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AverageGradeCard({ 
  averageGrade, 
  isLoading = false,
  error = null,
  onRetry
}: AverageGradeCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className='shadow-none border-none rounded-2xl'>
        <CardHeader className="flex flex-row items-center border-b justify-between space-y-0 px-6 pt-6">
          <div className="flex flex-row items-center gap-1.5 sm:gap-2">
            <Award strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Average Grade</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="sm:px-6 h-fit flex flex-col">
          <div className="h-[150px] flex flex-col items-center justify-center gap-3">
            <Award className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Loading grades...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we fetch grades</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start px-6">
          <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
            Average Grade: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            School average
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
            <Award strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <CardTitle className="text-sm sm:text-sm font-bold text-primary">Average Grade</CardTitle>
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
            Average Grade: <span className="text-primary/50">---</span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            School average
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
          <Award strokeWidth={2} className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <CardTitle className="text-sm sm:text-sm font-bold text-primary">Average Grade</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{averageGrade}%</div>
        <p className="text-xs text-muted-foreground">School average</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start px-6">
        <div className="text-lg sm:text-lg font-bold text-muted-foreground/50">
          Average Grade: <span className="text-primary">{averageGrade}%</span>
        </div>
        <p className="text-xs sm:text-sm font-medium text-muted-foreground">
          School average
        </p>
      </CardFooter>
    </Card>
  );
}
