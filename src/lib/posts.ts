import GithubSlugger from 'github-slugger'
import type {
  CategoryNode,
  PostMeta,
  RepoFile,
  RepoIndex,
  TocItem,
} from './types'

function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function parsePost(file: RepoFile): PostMeta {
  const segments = file.path.split('/')
  const filename = segments[segments.length - 1] ?? file.path
  const baseName = filename.replace(/\.md$/i, '')
  const match = /^(\d{4})(\d{2})(\d{2})[-_ ]?(.*)$/.exec(baseName)

  let date: string | null = null
  let dateDigits: string | null = null
  let title = baseName

  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    if (isValidDate(year, month, day)) {
      date = `${match[1]}-${match[2]}-${match[3]}`
      dateDigits = `${match[1]}${match[2]}${match[3]}`
    }
    title = match[4] || baseName
  }

  title = title.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim() || baseName

  const dirs = segments.slice(0, -1)

  return {
    path: file.path,
    title,
    dirs,
    category: dirs[0] ?? '',
    date,
    dateDigits,
    size: file.size,
  }
}

interface MutableNode {
  name: string
  path: string
  postCount: number
  children: Map<string, MutableNode>
}

function buildTree(sorted: PostMeta[]): CategoryNode[] {
  const roots = new Map<string, MutableNode>()

  for (const post of sorted) {
    let siblings = roots
    const trail: string[] = []

    for (const dir of post.dirs) {
      trail.push(dir)
      const path = trail.join('/')
      let node = siblings.get(dir)
      if (!node) {
        node = { name: dir, path, postCount: 0, children: new Map() }
        siblings.set(dir, node)
      }
      node.postCount += 1
      siblings = node.children
    }
  }

  const toNodes = (map: Map<string, MutableNode>): CategoryNode[] =>
    [...map.values()]
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
      .map((node) => ({
        name: node.name,
        path: node.path,
        count: node.postCount,
        children: toNodes(node.children),
      }))

  return toNodes(roots)
}

export function buildIndex(files: RepoFile[]): RepoIndex {
  const posts: PostMeta[] = []
  let aboutPath: string | null = null

  for (const file of files) {
    if (!/\.md$/i.test(file.path)) continue
    if (file.path.includes('/images/')) continue
    if (/(^|\/)\.[^/]/.test(file.path)) continue
    if (file.path.endsWith('.swp')) continue

    const baseName = (file.path.split('/').pop() ?? '').toLowerCase()
    if (baseName === 'readme.md') {
      if (file.path === 'README.md') aboutPath = file.path
      continue
    }
    if (baseName === 'plan.md' || baseName === 'templates.md') continue

    posts.push(parsePost(file))
  }

  const sorted = [...posts].sort((a, b) => {
    const aDate = a.date ?? '0000-00-00'
    const bDate = b.date ?? '0000-00-00'
    if (aDate !== bDate) return bDate.localeCompare(aDate)
    return a.title.localeCompare(b.title, 'ko')
  })

  const byPath = new Map(sorted.map((post) => [post.path, post]))
  const tree = buildTree(sorted)
  const categoryByPath = new Map<string, CategoryNode>()

  const collect = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      categoryByPath.set(node.path, node)
      collect(node.children)
    }
  }
  collect(tree)

  return {
    posts,
    sorted,
    byPath,
    tree,
    categoryByPath,
    latestDate: sorted.find((post) => post.date)?.date ?? null,
    aboutPath,
  }
}

function plainHeadingText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[*_~]/g, '')
    .replace(/\s+#+\s*$/, '')
    .trim()
}

export function extractToc(markdown: string): TocItem[] {
  const slugger = new GithubSlugger()
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const items: TocItem[] = []
  let inFence = false

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue

    const text = plainHeadingText(match[2])
    if (!text) continue

    items.push({
      depth: match[1].length,
      text,
      slug: slugger.slug(text),
    })
  }

  return items
}

function normalizeRepoPath(path: string): string | null {
  const stack: string[] = []
  for (const part of path.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') {
      if (!stack.length) return null
      stack.pop()
      continue
    }
    stack.push(part)
  }
  return stack.join('/')
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function resolveMarkdownPath(fromPath: string, href: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return null
  const clean = safeDecode(href.split('#')[0]?.split('?')[0] ?? '')
  if (!clean) return null

  if (clean.startsWith('/')) return normalizeRepoPath(clean)

  const baseDir = fromPath.includes('/')
    ? fromPath.slice(0, fromPath.lastIndexOf('/'))
    : ''
  return normalizeRepoPath(baseDir ? `${baseDir}/${clean}` : clean)
}

export function resolveImagePath(fromPath: string, src: string): string | null {
  return resolveMarkdownPath(fromPath, src)
}
