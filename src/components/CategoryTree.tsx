import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { categoryHref } from '@/lib/href'
import type { CategoryNode } from '@/lib/types'

interface CategoryTreeProps {
  nodes: CategoryNode[]
  activePath?: string | null
  depth?: number
  onNavigate?: () => void
}

export function CategoryTree({
  nodes,
  activePath,
  depth = 0,
  onNavigate,
}: CategoryTreeProps) {
  if (!nodes.length) return null

  return (
    <ul className={cn(depth > 0 && 'ml-2 border-l border-border pl-2')}>
      {nodes.map((node) => {
        const active = activePath === node.path
        return (
          <li key={node.path}>
            <Link
              to={categoryHref(node.path)}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-baseline justify-between gap-2 py-[5px] text-[13px] leading-5 transition-colors',
                active
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="truncate">{node.name}</span>
              <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                {node.count}
              </span>
            </Link>
            {node.children.length ? (
              <CategoryTree
                nodes={node.children}
                activePath={activePath}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
