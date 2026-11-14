import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PostRow } from '@/components/PostRow'
import { ErrorState, ListSkeleton } from '@/components/States'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRepoIndex } from '@/hooks/useRepo'

export function HomePage() {
  const { index, isPending, isError, refetch } = useRepoIndex()
  usePageTitle()

  if (isPending) return <ListSkeleton />

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  const recent = index.sorted.slice(0, 20)

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <h1 className="text-[13px] font-medium">최근 기록</h1>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {index.posts.length}
        </span>
      </div>

      {recent.length ? (
        recent.map((post) => <PostRow key={post.path} post={post} />)
      ) : (
        <p className="py-10 text-sm text-muted-foreground">—</p>
      )}

      <Link
        to="/archive"
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] underline-offset-4 hover:underline"
      >
        전체 기록
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
