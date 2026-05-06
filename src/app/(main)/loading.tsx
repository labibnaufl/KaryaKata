import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Skeleton */}
      <section className="bg-black py-20 md:py-32">
        <div className="container mx-auto px-8">
          <Skeleton className="h-16 md:h-20 w-3/4 max-w-2xl bg-white/20 mb-6" />
          <Skeleton className="h-6 md:h-8 w-full max-w-xl bg-white/20 mb-8" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40 bg-white/20" />
            <Skeleton className="h-12 w-40 bg-white/20" />
          </div>
        </div>
      </section>

      {/* Featured Skeleton */}
      <section className="py-16 md:py-24 bg-[#F5F5F0]">
        <div className="container mx-auto px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[300px] md:h-[400px] rounded-sm" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid Skeleton */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-8">
          <Skeleton className="h-8 w-48 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] rounded-sm" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
