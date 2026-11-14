import { useEffect } from 'react'
import { SITE } from '../lib/config'

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.title}` : SITE.title
  }, [title])
}
