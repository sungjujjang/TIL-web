import { readCache, writeCache } from './cache'
import { REPO } from './config'
import type { RepoFile, RepoSnapshot } from './types'

const API = 'https://api.github.com'
const SNAPSHOT_KEY = 'snapshot'
const FILE_TTL = 1000 * 60 * 60 * 24
const BRANCH_TTL = 1000 * 60 * 3
export const SNAPSHOT_TTL = 1000 * 60 * 3

const memoryFiles = new Map<string, string>()

function token(): string | undefined {
  const value = import.meta.env.VITE_GITHUB_TOKEN
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  }
  const auth = token()
  if (auth) headers.Authorization = `Bearer ${auth}`
  return headers
}

function isCommitRef(ref: string): boolean {
  return /^[0-9a-f]{7,40}$/i.test(ref)
}

export function encodeRepoPath(path: string): string {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

/** Raw GitHub first, jsDelivr as a CDN-backed fallback. */
export function fileUrls(path: string, ref: string): [string, string] {
  const safeRef = encodeURIComponent(ref)
  const encoded = encodeRepoPath(path)
  return [
    `https://raw.githubusercontent.com/${REPO.owner}/${REPO.name}/${safeRef}/${encoded}`,
    `https://cdn.jsdelivr.net/gh/${REPO.owner}/${REPO.name}@${safeRef}/${encoded}`,
  ]
}

export function assetUrl(path: string, ref: string): string {
  return fileUrls(path, ref)[0]
}

export function assetFallbackUrl(path: string, ref: string): string {
  return fileUrls(path, ref)[1]
}

export function getCachedSnapshot(): { snapshot: RepoSnapshot; savedAt: number } | null {
  const entry = readCache<RepoSnapshot>(SNAPSHOT_KEY)
  if (!entry || !Array.isArray(entry.data?.files)) return null
  return { snapshot: entry.data, savedAt: entry.savedAt }
}

async function fetchFromGitHub(): Promise<RepoSnapshot> {
  const commitResponse = await fetch(
    `${API}/repos/${REPO.owner}/${REPO.name}/commits/${REPO.branch}`,
    { headers: githubHeaders() },
  )

  if (!commitResponse.ok) {
    throw new Error(
      `GitHub commit API ${commitResponse.status} ${commitResponse.statusText}`,
    )
  }

  const commit = (await commitResponse.json()) as { sha: string }
  const treeResponse = await fetch(
    `${API}/repos/${REPO.owner}/${REPO.name}/git/trees/${commit.sha}?recursive=1`,
    { headers: githubHeaders() },
  )

  if (!treeResponse.ok) {
    throw new Error(
      `GitHub tree API ${treeResponse.status} ${treeResponse.statusText}`,
    )
  }

  const tree = (await treeResponse.json()) as {
    tree: Array<{ path: string; type: string; size?: number; sha?: string }>
  }

  const files: RepoFile[] = tree.tree
    .filter((entry) => entry.type === 'blob')
    .map((entry) => ({
      path: entry.path,
      size: entry.size ?? 0,
      sha: entry.sha,
    }))

  return {
    commit: commit.sha,
    fetchedAt: Date.now(),
    files,
    source: 'github',
  }
}

async function fetchFromJsDelivr(): Promise<RepoSnapshot> {
  const response = await fetch(
    `https://data.jsdelivr.com/v1/packages/gh/${REPO.owner}/${REPO.name}@${REPO.branch}?structure=flat`,
  )

  if (!response.ok) {
    throw new Error(`jsDelivr API ${response.status} ${response.statusText}`)
  }

  const payload = (await response.json()) as {
    files?: Array<{ name: string; size?: number; hash?: string }>
  }

  const files: RepoFile[] = (payload.files ?? [])
    .filter((entry) => entry.name && !entry.name.endsWith('/'))
    .map((entry) => ({
      path: entry.name.replace(/^\//, ''),
      size: entry.size ?? 0,
      sha: entry.hash,
    }))

  if (files.length === 0) {
    throw new Error('jsDelivr returned an empty file list')
  }

  return {
    commit: REPO.branch,
    fetchedAt: Date.now(),
    files,
    source: 'jsdelivr',
    stale: true,
  }
}

export async function fetchSnapshot(options?: { force?: boolean }): Promise<RepoSnapshot> {
  const cached = getCachedSnapshot()

  if (!options?.force && cached && Date.now() - cached.savedAt < SNAPSHOT_TTL) {
    return cached.snapshot
  }

  try {
    const snapshot = await fetchFromGitHub()
    writeCache(SNAPSHOT_KEY, snapshot)
    return snapshot
  } catch (githubError) {
    if (cached) {
      return { ...cached.snapshot, stale: true }
    }

    try {
      const fallback = await fetchFromJsDelivr()
      writeCache(SNAPSHOT_KEY, fallback)
      return fallback
    } catch {
      throw githubError
    }
  }
}

export async function fetchRepoFile(path: string, ref: string): Promise<string> {
  const key = `${ref}:${path}`
  const cached = readCache<string>(`file:${key}`)
  const ttl = isCommitRef(ref) ? FILE_TTL : BRANCH_TTL

  if (cached && Date.now() - cached.savedAt < ttl) {
    return cached.data
  }

  const inMemory = memoryFiles.get(key)
  if (inMemory) return inMemory

  const [primary, fallback] = fileUrls(path, ref)
  let response = await fetch(primary)
  if (!response.ok) {
    response = await fetch(fallback)
  }

  if (!response.ok) {
    throw new Error(`파일을 불러오지 못했습니다 (${response.status})`)
  }

  const text = await response.text()
  memoryFiles.set(key, text)
  writeCache(`file:${key}`, text)
  return text
}
