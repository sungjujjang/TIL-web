import { lazy, Suspense, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { SearchDialog } from './components/SearchDialog'
import { SiteLayout } from './components/SiteLayout'
import { ListSkeleton } from './components/States'
import { HomePage } from './pages/HomePage'

const ArchivePage = lazy(() =>
  import('./pages/ArchivePage').then((module) => ({ default: module.ArchivePage })),
)
const CategoryPage = lazy(() =>
  import('./pages/CategoryPage').then((module) => ({ default: module.CategoryPage })),
)
const PostPage = lazy(() =>
  import('./pages/PostPage').then((module) => ({ default: module.PostPage })),
)
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((module) => ({ default: module.AboutPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname, location.search])

  return null
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
        return
      }

      if (event.key === '/' && !isTyping && !searchOpen) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ScrollToTop />
        <SiteLayout onOpenSearch={() => setSearchOpen(true)}>
          <Suspense fallback={<ListSkeleton />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </SiteLayout>
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      </HashRouter>
    </QueryClientProvider>
  )
}
