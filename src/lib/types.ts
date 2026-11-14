export interface RepoFile {
  path: string
  size: number
  sha?: string
}

export type SnapshotSource = 'github' | 'jsdelivr'

export interface RepoSnapshot {
  commit: string
  fetchedAt: number
  files: RepoFile[]
  source: SnapshotSource
  stale?: boolean
}

export interface PostMeta {
  path: string
  title: string
  dirs: string[]
  category: string
  date: string | null
  dateDigits: string | null
  size: number
}

export interface CategoryNode {
  name: string
  path: string
  count: number
  children: CategoryNode[]
}

export interface RepoIndex {
  posts: PostMeta[]
  sorted: PostMeta[]
  byPath: Map<string, PostMeta>
  tree: CategoryNode[]
  categoryByPath: Map<string, CategoryNode>
  latestDate: string | null
  aboutPath: string | null
}

export interface TocItem {
  depth: number
  text: string
  slug: string
}
