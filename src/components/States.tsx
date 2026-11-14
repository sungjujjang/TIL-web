import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function ListSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <div aria-hidden="true">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-8" />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="flex items-baseline justify-between gap-6 border-b border-border py-4"
        >
          <div className="w-full space-y-2">
            <Skeleton className="h-4" style={{ width: `${45 + ((index * 17) % 40)}%` }} />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="h-2.5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function ArticleSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-3 w-32" />
      <div className="space-y-3 border-t border-border pt-8">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-4"
            style={{ width: `${60 + ((index * 13) % 38)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = '불러오지 못했습니다',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[40vh] flex-col items-start justify-center gap-4">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      {message ? (
        <p className="max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      ) : null}
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          다시 시도
        </Button>
      ) : null}
    </div>
  )
}
