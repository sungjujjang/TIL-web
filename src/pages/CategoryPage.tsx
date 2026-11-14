import { Fragment } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PostRow } from '@/components/PostRow'
import { ErrorState, ListSkeleton } from '@/components/States'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRepoIndex } from '@/hooks/useRepo'
import { groupByMonth } from '@/lib/format'
import { categoryHref } from '@/lib/href'

export function CategoryPage() {
  const { index, isPending, isError, refetch } = useRepoIndex()
  const [searchParams] = useSearchParams()
  const path = searchParams.get('c') ?? ''
  const node = path ? index.categoryByPath.get(path) : undefined
  usePageTitle(node ? node.name : '카테고리')

  if (isPending) return <ListSkeleton />

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  const posts = path
    ? index.sorted.filter((post) => {
        const dir = post.dirs.join('/')
        return dir === path || dir.startsWith(`${path}/`)
      })
    : index.sorted
  const groups = groupByMonth(posts)
  const segments = path.split('/').filter(Boolean)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
        <h1 className="min-w-0 text-[13px] font-medium">
          {segments.length ? (
            segments.map((segment, position) => {
              const target = segments.slice(0, position + 1).join('/')
              const last = position === segments.length - 1
              return (
                <Fragment key={target}>
                  {position > 0 ? (
                    <span className="px-1.5 text-muted-foreground">/</span>
                  ) : null}
                  {last ? (
                    <span>{segment}</span>
                  ) : (
                    <Link
                      to={categoryHref(target)}
                      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {segment}
                    </Link>
                  )}
                </Fragment>
              )
            })
          ) : (
            <span>카테고리</span>
          )}
        </h1>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {posts.length}
        </span>
      </div>

      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="pt-8 pb-1 text-[11px] tabular-nums text-muted-foreground">
            {group.label}
          </h2>
          {group.posts.map((post) => (
            <PostRow key={post.path} post={post} />
          ))}
        </section>
      ))}

      {groups.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">—</p>
      ) : null}
    </div>
  )
}
