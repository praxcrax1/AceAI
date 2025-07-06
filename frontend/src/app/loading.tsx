import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
      </div>

      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>
    </div>
  );
}
