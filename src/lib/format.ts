import type { PostMeta } from './types'

export interface MonthGroup {
  key: string
  label: string
  posts: PostMeta[]
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return date.replaceAll('-', '.')
}

export function formatMonthLabel(key: string): string {
  const [year, month] = key.split('-')
  return `${year}.${String(month).padStart(2, '0')}`
}

export function groupByMonth(posts: PostMeta[]): MonthGroup[] {
  const groups: MonthGroup[] = []

  for (const post of posts) {
    const key = post.date ? post.date.slice(0, 7) : 'unknown'
    const last = groups[groups.length - 1]

    if (last?.key === key) {
      last.posts.push(post)
      continue
    }

    groups.push({
      key,
      label: key === 'unknown' ? '—' : formatMonthLabel(key),
      posts: [post],
    })
  }

  return groups
}
