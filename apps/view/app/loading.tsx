import { Skeleton } from '@repo/ui'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="container mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
    </main>
  )
}
