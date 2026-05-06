export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-[#F8F4ED] animate-pulse">
      {/* Header Skeleton */}
      <div className="relative w-full h-[50vh] bg-gray-200">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-300/60 via-gray-300/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-10">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge Skeleton */}
            <div className="w-24 h-6 bg-white/50 rounded mb-4" />
            
            {/* Title Skeleton */}
            <div className="w-3/4 h-12 bg-white/50 rounded mb-6" />
            
            {/* Meta Skeleton */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/30 rounded-full" />
              <div className="w-32 h-4 bg-white/30 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-6 md:px-12 lg:px-20 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-12">
            {/* Main Content Skeleton */}
            <div className="space-y-4">
              <div className="w-full h-32 bg-gray-200 rounded" />
              <div className="w-5/6 h-4 bg-gray-200 rounded" />
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-4/5 h-4 bg-gray-200 rounded" />
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-2/3 h-4 bg-gray-200 rounded" />
              <div className="w-full h-64 bg-gray-200 rounded my-8" />
              <div className="w-5/6 h-4 bg-gray-200 rounded" />
              <div className="w-full h-4 bg-gray-200 rounded" />
            </div>

            {/* Sidebar Skeleton */}
            <div className="hidden lg:block space-y-4">
              <div className="w-32 h-6 bg-gray-200 rounded mb-6" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
