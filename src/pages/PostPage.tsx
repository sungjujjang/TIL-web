import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GithubIcon } from '@/components/GithubIcon'
import { MarkdownView } from '@/components/MarkdownView'
import { ArticleSkeleton, ErrorState } from '@/components/States'
import { MobileToc, Toc } from '@/components/Toc'
import { usePageTitle } from '@/hooks/usePageTitle'
import { usePostContent, usePostToc, useRepoIndex } from '@/hooks/useRepo'
import { formatDate } from '@/lib/format'
import { categoryHref, githubBlobUrl, postHref } from '@/lib/href'

export function PostPage() {
  const [searchParams] = useSearchParams()
  const postPath = searchParams.get('p')
  const { index, snapshot, isPending, isError, refetch } = useRepoIndex()
  const post = postPath ? index.byPath.get(postPath) : undefined
  const contentQuery = usePostContent(post, snapshot?.commit)
  const toc = usePostToc(contentQuery.data)
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  usePageTitle(post?.title)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? Math.min(100, (doc.scrollTop / total) * 100) : 0)
      setShowTop(doc.scrollTop > 900)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const navigation = useMemo(() => {
    if (!post) return { older: null, newer: null }
    const position = index.sorted.findIndex((item) => item.path === post.path)
    if (position === -1) return { older: null, newer: null }
    return {
      older: index.sorted[position + 1] ?? null,
      newer: position > 0 ? index.sorted[position - 1] : null,
    }
  }, [index.sorted, post])

  if (isPending) {
    return (
      <div>
        <div className="space-y-4 border-b border-border pb-6" aria-hidden="true">
          <div className="h-3 w-24 bg-muted" />
          <div className="h-9 w-3/4 bg-muted" />
          <div className="h-3 w-32 bg-muted" />
        </div>
        <div className="pt-8">
          <ArticleSkeleton />
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />
  }

  if (!post) {
    return (
      <div>
        <ErrorState title="글을 찾을 수 없습니다" />
        <Link
          to="/archive"
          className="mt-4 inline-block text-[13px] underline-offset-4 hover:underline"
        >
          전체 기록
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div
        aria-hidden="true"
        className="fixed top-14 left-0 z-30 h-px bg-foreground"
        style={{ width: `${progress}%` }}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_200px]">
        <article className="min-w-0">
          <header className="border-b border-border pb-6">
            {post.dirs.length ? (
              <div className="mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
                {post.dirs.map((segment, position) => {
                  const target = post.dirs.slice(0, position + 1).join('/')
                  return (
                    <span key={target} className="flex items-center gap-1.5">
                      {position > 0 ? <span>/</span> : null}
                      <Link
                        to={categoryHref(target)}
                        className="underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {segment}
                      </Link>
                    </span>
                  )
                })}
              </div>
            ) : null}

            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em] sm:text-[32px]">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <time
                dateTime={post.date ?? undefined}
                className="text-[11px] tabular-nums text-muted-foreground"
              >
                {formatDate(post.date)}
              </time>
              <Button variant="ghost" size="sm" asChild className="h-7 px-2">
                <a
                  href={githubBlobUrl(post.path)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <GithubIcon size={14} />
                  GitHub
                </a>
              </Button>
              <MobileToc items={toc} />
            </div>
          </header>

          <div className="pt-8">
            {contentQuery.isPending ? (
              <ArticleSkeleton />
            ) : contentQuery.isError ? (
              <ErrorState
                onRetry={() => void contentQuery.refetch()}
                title="본문을 불러오지 못했습니다"
              />
            ) : (
              <MarkdownView
                content={contentQuery.data}
                postPath={post.path}
                refName={snapshot?.commit ?? 'main'}
                posts={index.byPath}
                hideLeadingTitle
              />
            )}
          </div>

          <nav
            aria-label="이전 글과 다음 글"
            className="mt-14 grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
          >
            {navigation.older ? (
              <Link
                to={postHref(navigation.older.path)}
                className="group min-w-0"
              >
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ArrowLeft className="size-3" />
                  이전 글
                </span>
                <span className="mt-1 block truncate text-[13px] underline-offset-4 group-hover:underline">
                  {navigation.older.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {navigation.newer ? (
              <Link
                to={postHref(navigation.newer.path)}
                className="group min-w-0 sm:text-right"
              >
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground sm:justify-end">
                  다음 글
                  <ArrowRight className="size-3" />
                </span>
                <span className="mt-1 block truncate text-[13px] underline-offset-4 group-hover:underline">
                  {navigation.newer.title}
                </span>
              </Link>
            ) : null}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Toc items={toc} />
          </div>
        </aside>
      </div>

      {showTop ? (
        <Button
          variant="outline"
          size="icon"
          className="fixed right-5 bottom-5 z-30 size-9 bg-background"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="맨 위로"
        >
          <ArrowUp className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}
