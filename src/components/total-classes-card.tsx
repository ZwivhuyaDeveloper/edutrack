import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCw } from 'lucide-react';

export interface TotalClassesCardProps {
  totalClasses: number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function TotalClassesCard({ 
  totalClasses, 
  isLoading = false,
  error = null,
  onRetry
}: TotalClassesCardProps) {
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
        <p className="text-xs text-muted-foreground">Active classes</p>
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
