import { useNavigate } from 'react-router-dom'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useRepoIndex } from '@/hooks/useRepo'
import { formatDate } from '@/lib/format'
import { postHref } from '@/lib/href'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const { index } = useRepoIndex()
  const navigate = useNavigate()

  return (
    <CommandDialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
      title="검색"
      description="글 검색"
      key={open ? 'open' : 'closed'}
    >
      <CommandInput placeholder="검색" />
      <CommandList>
        <CommandEmpty>—</CommandEmpty>
        <CommandGroup heading="글">
          {index.sorted.map((post) => (
            <CommandItem
              key={post.path}
              value={`${post.title} ${post.path} ${post.date ?? ''}`}
              onSelect={() => {
                navigate(postHref(post.path))
                onClose()
              }}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="min-w-0 flex-1 truncate">
                <span className="text-[13px] font-medium">{post.title}</span>
                {post.dirs.length ? (
                  <span className="ml-2 text-[11px] text-muted-foreground">
                    {post.dirs.join('/')}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {formatDate(post.date)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
