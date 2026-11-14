import { useState, type ReactNode } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface SiteLayoutProps {
  children: ReactNode
  onOpenSearch: () => void
}

export function SiteLayout({ children, onOpenSearch }: SiteLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-svh bg-background">
      <Topbar onOpenSearch={onOpenSearch} onOpenMenu={() => setMenuOpen(true)} />

      <div className="mx-auto flex w-full max-w-[1440px] items-start">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-[264px] shrink-0 border-r border-border md:block">
          <ScrollArea className="h-full">
            <Sidebar />
          </ScrollArea>
        </aside>

        <main
          id="main"
          className="min-w-0 flex-1 px-4 py-8 sm:px-7 sm:py-10 lg:px-10"
        >
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetTitle className="sr-only">TIL</SheetTitle>
          <SheetDescription className="sr-only">TIL</SheetDescription>
          <ScrollArea className="h-full">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
