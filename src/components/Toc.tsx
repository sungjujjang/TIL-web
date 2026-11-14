import { useEffect, useState } from 'react'
import { List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/lib/types'

export function scrollToHeading(slug: string) {
  const element = document.getElementById(slug)
  if (!element) return
  const top = element.getBoundingClientRect().top + window.scrollY - 72
  window.scrollTo({ top, behavior: 'smooth' })
}

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!items.length) return

    const update = () => {
      let current = ''
      for (const item of items) {
        const element = document.getElementById(item.slug)
        if (!element) continue
        if (element.getBoundingClientRect().top <= 140) current = item.slug
        else break
      }
      setActive(current)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [items])

  return active
}

function TocList({
  items,
  active,
  onSelect,
}: {
  items: TocItem[]
  active: string
  onSelect?: () => void
}) {
  return (
    <ol className="border-l border-border">
      {items.map((item) => (
        <li key={item.slug}>
          <button
            type="button"
            onClick={() => {
              scrollToHeading(item.slug)
              onSelect?.()
            }}
            className={cn(
              '-ml-px block w-full border-l border-transparent py-1 pr-2 text-left text-[12.5px] leading-5 transition-colors',
              item.depth === 3 ? 'pl-6' : 'pl-3',
              active === item.slug
                ? 'border-foreground font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ol>
  )
}

export function Toc({ items }: { items: TocItem[] }) {
  const active = useActiveHeading(items)

  if (items.length < 2) return null

  return (
    <nav aria-label="목차" className="hidden lg:block">
      <p className="mb-3 text-[11px] text-muted-foreground">목차</p>
      <TocList items={items} active={active} />
    </nav>
  )
}

export function MobileToc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false)
  const active = useActiveHeading(items)

  if (items.length < 2) return null

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <List className="size-4" />
          목차
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px]">
        <SheetTitle className="text-sm">목차</SheetTitle>
        <SheetDescription className="sr-only">목차</SheetDescription>
        <ScrollArea className="mt-4 h-[calc(100svh-5rem)]">
          <TocList
            items={items}
            active={active}
            onSelect={() => window.setTimeout(() => setOpen(false), 60)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
