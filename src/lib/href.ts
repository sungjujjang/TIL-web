import { REPO } from './config'
import { encodeRepoPath } from './repo'

export function postHref(path: string): string {
  return `/post?p=${encodeURIComponent(path)}`
}

export function categoryHref(path: string | null | undefined): string {
  return path ? `/category?c=${encodeURIComponent(path)}` : '/category'
}

export function githubBlobUrl(path: string): string {
  return `${REPO.url}/blob/${REPO.branch}/${encodeRepoPath(path)}`
}
