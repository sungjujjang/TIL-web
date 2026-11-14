import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/format'
import { postHref } from '@/lib/href'
import type { PostMeta } from '@/lib/types'

export function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      to={postHref(post.path)}
      className="group flex items-baseline gap-4 border-b border-border py-4 sm:gap-6"
    >
      <div className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium leading-6 tracking-[-0.01em] text-foreground decoration-1 underline-offset-4 group-hover:underline">
          {post.title}
        </span>
        {post.dirs.length ? (
          <span className="mt-1 block truncate text-[11px] text-muted-foreground">
            {post.dirs.join(' / ')}
          </span>
        ) : null}
      </div>
      <time
        dateTime={post.date ?? undefined}
        className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
      >
        {formatDate(post.date)}
      </time>
    </Link>
  )
}
