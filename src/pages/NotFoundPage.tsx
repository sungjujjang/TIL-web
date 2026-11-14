import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'

export function NotFoundPage() {
  usePageTitle('404')

  return (
    <div className="flex min-h-[60vh] flex-col justify-center gap-6">
      <p className="text-[13px] text-muted-foreground">404</p>
      <div className="flex items-center gap-5 text-sm">
        <Link to="/" className="underline-offset-4 hover:underline">
          TIL
        </Link>
        <Link to="/archive" className="underline-offset-4 hover:underline">
          전체 기록
        </Link>
      </div>
    </div>
  )
}
