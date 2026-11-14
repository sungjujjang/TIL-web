import { GithubIcon } from '@/components/GithubIcon'
import { MarkdownView } from '@/components/MarkdownView'
import { ArticleSkeleton, ErrorState } from '@/components/States'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useRepoFile, useRepoIndex } from '@/hooks/useRepo'
import { REPO } from '@/lib/config'

export function AboutPage() {
  const { index, snapshot, isPending, isError, refetch } = useRepoIndex()
  const readme = useRepoFile(index.aboutPath, snapshot?.commit)
  usePageTitle('README')

  if (isPending) return <ArticleSkeleton />

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h1 className="text-[13px] font-medium">README</h1>
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
