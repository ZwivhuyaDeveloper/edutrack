export default function Loading() {
  return (
    <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4 px-2 sm:px-0">
      <div className="grid space-y-3 sm:space-y-4 bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl lg:grid-cols-1">
        {/* Stats Cards Skeleton */}
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-none shadow-none bg-zinc-100 overflow-hidden rounded-lg p-3 sm:p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-3 w-20 sm:h-4 sm:w-24 bg-zinc-300 animate-pulse rounded" />
                </div>
                <div className="h-7 w-14 sm:w-16 bg-zinc-300 animate-pulse rounded" />
              </div>
              <div className="space-y-1 sm:space-y-2 pt-0">
                <div className="h-6 w-16 sm:h-8 sm:w-20 bg-zinc-300 animate-pulse rounded" />
                <div className="h-3 w-28 sm:w-32 bg-zinc-300 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats Skeleton */}
        <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-none shadow-none bg-zinc-100 rounded-lg p-3 sm:p-6">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 bg-zinc-300 animate-pulse rounded" />
                  <div className="h-3 w-16 sm:h-4 sm:w-20 bg-zinc-300 animate-pulse rounded" />
                </div>
                <div className="h-7 w-14 sm:w-16 bg-zinc-300 animate-pulse rounded" />
              </div>
              <div className="pt-0">
                <div className="h-6 w-14 sm:h-8 sm:w-16 bg-zinc-300 animate-pulse rounded mb-2" />
                <div className="h-3 w-24 sm:w-28 bg-zinc-300 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="border-none shadow-none bg-zinc-100 rounded-lg p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex flex-col gap-1 sm:gap-2">
                <div className="h-5 w-40 sm:h-6 sm:w-48 bg-zinc-300 animate-pulse rounded" />
                <div className="h-3 w-48 sm:h-4 sm:w-56 bg-zinc-300 animate-pulse rounded" />
              </div>
              <div className="h-8 w-full sm:h-9 sm:w-32 bg-zinc-300 animate-pulse rounded" />
            </div>
          </div>
          <div className="pt-0">
            <div className="space-y-2 sm:space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 bg-zinc-300 animate-pulse rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-zinc-300 animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-zinc-300 animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
