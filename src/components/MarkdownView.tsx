import {
  Children,
  isValidElement,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { ImageOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { REPO } from '@/lib/config'
import { encodeRepoPath, fileUrls } from '@/lib/repo'
import { postHref } from '@/lib/href'
import { resolveImagePath, resolveMarkdownPath } from '@/lib/posts'
import type { PostMeta } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CodeBlock } from './CodeBlock'
import { Lightbox, type LightboxImage } from './Lightbox'
import { scrollToHeading } from './Toc'

function nodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return nodeText(node.props.children)
  }
  return ''
}

interface MarkdownImageProps {
  src?: string
  alt?: string
  postPath: string
  refName: string
  onZoom: (image: LightboxImage) => void
}

function MarkdownImage({ src, alt, postPath, refName, onZoom }: MarkdownImageProps) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  const external = Boolean(src && /^(https?:)?\/\//.test(src))
  const resolved = src && !external ? resolveImagePath(postPath, src) : null
  const urls = resolved ? fileUrls(resolved, refName) : null
  const currentSrc = external ? src : (urls?.[attempt] ?? src)
  const caption = alt?.trim() ?? ''
  const showCaption = caption.length > 2 && !/^\d+$/.test(caption)


  const onError = () => {
    if (external || !resolved) {
      setFailed(true)
      return
    }
    if (attempt === 0) setAttempt(1)
    else setFailed(true)
  }

  if (!src || failed) {
    return (
      <span className="my-6 flex items-center gap-2 text-sm text-muted-foreground">
        <ImageOff className="size-4" />
        <span>{caption || '—'}</span>
      </span>
    )
  }

  const open = () => {
    if (!currentSrc) return
    onZoom({ src: currentSrc, alt: caption })
  }

  return (
    <span className="my-6 block">
      <span
        role="button"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            open()
          }
        }}
        className="block cursor-zoom-in"
        aria-label={caption || '이미지 크게 보기'}
      >
        <img
          src={currentSrc}
          alt={caption}
          loading="lazy"
          decoding="async"
          onError={onError}
          className="max-h-[70svh] w-full object-contain"
        />
      </span>
      {showCaption ? (
        <span className="mt-2 block text-center text-[11px] text-muted-foreground">
          {caption}
        </span>
      ) : null}
    </span>
  )
}

interface MarkdownViewProps {
  content: string
  postPath: string
  refName: string
  posts: Map<string, PostMeta>
  hideLeadingTitle?: boolean
}

function withoutLeadingTitle(content: string): string {
  return content.replace(/^\s*#\s+[^\n]*(?:\r?\n|$)/, '')
}

export function MarkdownView({
  content,
  postPath,
  refName,
  posts,
  hideLeadingTitle = false,
}: MarkdownViewProps) {
  const [zoom, setZoom] = useState<LightboxImage | null>(null)
  const closeZoom = useCallback(() => setZoom(null), [])

  const components = useMemo<Components>(
    () => ({
      pre({ children }) {
        const first = Children.toArray(children)[0]
        let language: string | undefined

        if (isValidElement<{ className?: string }>(first)) {
          const className = first.props.className ?? ''
          language = /language-([\w+#-]+)/.exec(className)?.[1]
        }

        return (
          <CodeBlock code={nodeText(children)} language={language}>
            {children}
          </CodeBlock>
        )
      },
      code({ className, children }) {
        const isBlock = Boolean(className && /language-|hljs/.test(className))
        return (
          <code className={cn(isBlock ? className : 'inline-code')}>
            {children}
          </code>
        )
      },
      a({ href, children }) {
        const value = href ?? ''

        if (value.startsWith('#')) {
          return (
            <a
              href={value}
              onClick={(event) => {
                event.preventDefault()
                try {
                  scrollToHeading(decodeURIComponent(value.slice(1)))
                } catch {
                  scrollToHeading(value.slice(1))
                }
              }}
            >
              {children}
            </a>
          )
        }

        const resolved = resolveMarkdownPath(postPath, value)
        const target = resolved ? posts.get(resolved) : undefined
        if (target) {
          return <Link to={postHref(target.path)}>{children}</Link>
        }

        if (/^(https?:|mailto:)/i.test(value)) {
          return (
            <a href={value} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          )
        }

        if (resolved) {
          const isFile = /\.[a-z0-9]{1,8}$/i.test(resolved)
          const url = isFile
            ? fileUrls(resolved, refName)[0]
            : `${REPO.url}/tree/${REPO.branch}/${encodeRepoPath(resolved)}`
          return (
            <a href={url} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          )
        }

        return <a href={value}>{children}</a>
      },
      img({ src, alt }) {
        return (
          <MarkdownImage
            key={`${postPath}:${src ?? ''}`}
            src={src}
            alt={alt}
            postPath={postPath}
            refName={refName}
            onZoom={setZoom}
          />
        )
      },
      h2({ id, children }) {
        return (
          <h2 id={id}>
            {children}
            {id ? (
              <button
                type="button"
                className="heading-anchor"
                onClick={() => scrollToHeading(id)}
                aria-label="이 섹션으로 이동"
              >
                #
              </button>
            ) : null}
          </h2>
        )
      },
      h3({ id, children }) {
        return (
          <h3 id={id}>
            {children}
            {id ? (
              <button
                type="button"
                className="heading-anchor"
                onClick={() => scrollToHeading(id)}
                aria-label="이 섹션으로 이동"
              >
                #
              </button>
            ) : null}
          </h3>
        )
      },
      table({ children }) {
        return (
          <div className="my-6 overflow-x-auto border-y border-border">
            <table>{children}</table>
          </div>
        )
      },
      input({ checked, type }) {
        return <input type={type} checked={Boolean(checked)} disabled readOnly />
      },
    }),
    [postPath, refName, posts],
  )

  return (
    <>
      <div className="prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            rehypeSlug,
            [rehypeHighlight, { detect: true, ignoreMissing: true }],
          ]}
          components={components}
        >
          {hideLeadingTitle ? withoutLeadingTitle(content) : content}
        </ReactMarkdown>
      </div>
      <Lightbox image={zoom} onClose={closeZoom} />
    </>
  )
}
