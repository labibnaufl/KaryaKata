export default function ArticlesLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <div className="h-64 md:h-80 bg-gray-100 animate-pulse">
        <div className="container mx-auto px-8 h-full flex flex-col justify-center">
          <div className="h-10 md:h-12 w-64 bg-gray-200 rounded mb-4" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="container mx-auto px-8 py-12">
        {/* Filter Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="h-10 flex-1 max-w-md bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[16/10] bg-gray-100 rounded animate-pulse" />
              <div className="h-6 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-8 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
