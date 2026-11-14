import { Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { GithubIcon } from './GithubIcon'
import { REPO } from '@/lib/config'

interface TopbarProps {
  onOpenSearch: () => void
  onOpenMenu: () => void
}

export function Topbar({ onOpenSearch, onOpenMenu }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-1 px-3 sm:px-5">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenMenu}
          aria-label="메뉴"
        >
          <Menu className="size-5" />
        </Button>

        <Link
          to="/"
          className="px-2 text-[15px] font-bold tracking-[-0.04em] text-foreground"
        >
          TIL
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSearch}
            className="gap-2 px-2 text-muted-foreground hover:text-foreground"
            aria-label="검색"
          >
            <Search className="size-4" />
            <kbd className="hidden text-[11px] font-normal tabular-nums sm:inline">
              ⌘K
            </kbd>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={REPO.url}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon size={17} />
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
