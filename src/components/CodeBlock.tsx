import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
      return true
    } catch {
      return false
    }
  }
}

interface CodeBlockProps {
  code: string
  language?: string
  children: ReactNode
}

export function CodeBlock({ code, language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const onCopy = async () => {
    const ok = await copyText(code)
    if (!ok) return
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="my-6 border-y border-border bg-muted/40">
      <div className="flex h-9 items-center justify-between border-b border-border px-3">
        <span className="text-[11px] text-muted-foreground">
          {language ?? 'text'}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={() => void onCopy()}
          aria-label={copied ? '복사됨' : '코드 복사'}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-6">
        {children}
      </pre>
    </div>
  )
}
