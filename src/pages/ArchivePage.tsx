import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PostRow } from '@/components/PostRow'
import { ErrorState, ListSkeleton } from '@/components/States'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRepoIndex } from '@/hooks/useRepo'
import { groupByMonth } from '@/lib/format'

export function ArchivePage() {
  const { index, isPending, isError, refetch } = useRepoIndex()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const yearParam = searchParams.get('year')
  usePageTitle('전체 기록')

  const years = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of index.sorted) {
      if (!post.date) continue
      const year = post.date.slice(0, 4)
      counts.set(year, (counts.get(year) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [index.sorted])

  if (isPending) return <ListSkeleton />

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  const activeYear =
    yearParam && years.some(([year]) => year === yearParam) ? yearParam : null
  const posts = activeYear
    ? index.sorted.filter((post) => post.date?.startsWith(activeYear))
    : index.sorted
  const groups = groupByMonth(posts)

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-border pb-3">
        <h1 className="text-[13px] font-medium">전체 기록</h1>
        <span className="text-[11px] tabular-nums text-muted-foreground">
          {index.posts.length}
        </span>
      </div>

      {years.length ? (
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={activeYear ?? 'all'}
          onValueChange={(value) => {
            if (!value) return
            navigate(value === 'all' ? '/archive' : `/archive?year=${value}`)
          }}
          className="mt-5 flex-wrap justify-start"
        >
          <ToggleGroupItem value="all" className="px-2.5 text-[11px]">
            전체
          </ToggleGroupItem>
          {years.map(([year, count]) => (
            <ToggleGroupItem
              key={year}
              value={year}
              className="gap-1.5 px-2.5 text-[11px] tabular-nums"
            >
              {year}
              <span className="text-muted-foreground">{count}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}

      <div>
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
      </div>

      {groups.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">—</p>
      ) : null}
    </div>
  )
}
