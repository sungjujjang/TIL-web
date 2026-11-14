import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CategoryTree } from './CategoryTree'
import { useRepoIndex } from '@/hooks/useRepo'
import { REPO } from '@/lib/config'
import { cn } from '@/lib/utils'

interface SidebarProps {
  onNavigate?: () => void
}

const links = [
  { to: '/', label: 'README' },
  { to: '/archive', label: '전체 기록' },
]

export function Sidebar({ onNavigate }: SidebarProps) {
  const { index, snapshot, isPending, isError, refetch } = useRepoIndex()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const activePath = searchParams.get('c')

  if (isPending) {
    return (
      <div className="space-y-6 px-4 py-6" aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-2 border-t border-border pt-5">
          {Array.from({ length: 14 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-3"
              style={{ width: `${40 + ((index * 19) % 45)}%`, marginLeft: (index % 3) * 10 }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3 px-4 py-6">
        <p className="text-[13px] text-muted-foreground">목록을 불러오지 못했습니다.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-4 py-6">
      <nav className="flex flex-col gap-1" aria-label="TIL">
        {links.map((link) => {
          const active =
            link.to === '/'
              ? location.pathname === '/' || location.pathname === '/about'
              : location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={cn(
                'py-1 text-sm transition-colors',
                active
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-8 border-t border-border pt-5">
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">카테고리</p>
        {index.tree.length ? (
          <nav aria-label="카테고리">
            <CategoryTree
              nodes={index.tree}
              activePath={activePath}
              onNavigate={onNavigate}
            />
          </nav>
        ) : (
          <p className="px-1 text-[13px] text-muted-foreground">—</p>
        )}
      </div>

      <div className="mt-auto space-y-2 pt-10">
        <a
          href={REPO.url}
          target="_blank"
          rel="noreferrer"
          className="block text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {REPO.slug}
        </a>
        {snapshot?.stale ? (
          <p className="text-[11px] leading-5 text-muted-foreground">
            GitHub API 한도로 이전 목록을 표시합니다.
          </p>
        ) : null}
      </div>
    </div>
  )
}
