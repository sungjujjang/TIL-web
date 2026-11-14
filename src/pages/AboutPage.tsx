import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { GithubIcon } from '@/components/GithubIcon'
import { MarkdownView } from '@/components/MarkdownView'
import { ArticleSkeleton, ErrorState } from '@/components/States'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRepoFile, useRepoIndex } from '@/hooks/useRepo'
import { REPO } from '@/lib/config'
import { fetchSnapshot } from '@/lib/repo'
import { cn } from '@/lib/utils'

export function AboutPage() {
  const { index, snapshot, isPending, isError, refetch } = useRepoIndex()
  const readme = useRepoFile(index.aboutPath, snapshot?.commit)
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)
  usePageTitle('README')

  const refresh = async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      const next = await fetchSnapshot({ force: true })
      queryClient.setQueryData(['repo-snapshot'], next)
    } catch {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  if (isPending) return <ArticleSkeleton />

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h1 className="text-[13px] font-medium">README</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label="README 새로고침"
          >
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            <span className="hidden sm:inline">새로고침</span>
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2">
            <a
              href={REPO.url}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon size={14} />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      <div className="pt-8">
        {readme.isPending ? (
          <ArticleSkeleton />
        ) : readme.isError ? (
          <ErrorState title="README를 불러오지 못했습니다" />
        ) : (
          <MarkdownView
            content={readme.data}
            postPath={index.aboutPath ?? 'README.md'}
            refName={snapshot?.commit ?? 'main'}
            posts={index.byPath}
          />
        )}
      </div>
    </div>
  )
}
