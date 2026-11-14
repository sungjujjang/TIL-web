import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { buildIndex, extractToc } from '../lib/posts'
import {
  fetchRepoFile,
  fetchSnapshot,
  getCachedSnapshot,
  SNAPSHOT_TTL,
} from '../lib/repo'
import type { PostMeta } from '../lib/types'

const cachedSnapshot = getCachedSnapshot()

export function useSnapshot() {
  return useQuery({
    queryKey: ['repo-snapshot'],
    queryFn: () => fetchSnapshot(),
    staleTime: SNAPSHOT_TTL,
    gcTime: 1000 * 60 * 60 * 3,
    retry: 1,
    refetchOnWindowFocus: false,
    initialData: cachedSnapshot?.snapshot,
    initialDataUpdatedAt: cachedSnapshot?.savedAt,
  })
}

export function useRepoIndex() {
  const snapshotQuery = useSnapshot()
  const index = useMemo(
    () => buildIndex(snapshotQuery.data?.files ?? []),
    [snapshotQuery.data],
  )

  return { ...snapshotQuery, snapshot: snapshotQuery.data, index }
}

export function usePostContent(post: PostMeta | undefined, ref: string | undefined) {
  return useQuery({
    queryKey: ['repo-file', ref, post?.path],
    queryFn: () => fetchRepoFile(post!.path, ref!),
    enabled: Boolean(post && ref),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}

export function usePostToc(markdown: string | undefined) {
  return useMemo(() => (markdown ? extractToc(markdown) : []), [markdown])
}

export function useRepoFile(path: string | null | undefined, ref: string | undefined) {
  return useQuery({
    queryKey: ['repo-file', ref, path],
    queryFn: () => fetchRepoFile(path!, ref!),
    enabled: Boolean(path && ref),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 6,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
