import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Matches `--fa-expand-reveal-duration` in FigmaAiToolwindow.css (grid collapse / expand). */
export const AIA_CMD_EXPAND_REVEAL_MS = 180

/** Grid reveal under the snippet header — body grows downward; keeps children mounted through close. */
export function AiaCmdExpandReveal({ open, children }: { open: boolean; children: ReactNode }) {
  const cachedChildrenRef = useRef<ReactNode>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [heightOpen, setHeightOpen] = useState(false)
  const [, setExitGeneration] = useState(0)

  if (open && children != null) {
    cachedChildrenRef.current = children
  }

  useEffect(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    if (open) {
      let raf2 = 0
      const raf1 = window.requestAnimationFrame(() => {
        raf2 = window.requestAnimationFrame(() => setHeightOpen(true))
      })
      return () => {
        window.cancelAnimationFrame(raf1)
        if (raf2) window.cancelAnimationFrame(raf2)
      }
    }

    setHeightOpen(false)

    if (cachedChildrenRef.current == null) return

    closeTimerRef.current = window.setTimeout(() => {
      cachedChildrenRef.current = null
      closeTimerRef.current = null
      setExitGeneration((g) => g + 1)
    }, AIA_CMD_EXPAND_REVEAL_MS)

    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }
  }, [open])

  if (cachedChildrenRef.current == null) return null

  return (
    <div
      className={[
        'figma-ai-tw__aiaCmdExpandReveal',
        open && heightOpen ? 'figma-ai-tw__aiaCmdExpandReveal--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="figma-ai-tw__aiaCmdExpandRevealInner">{cachedChildrenRef.current}</div>
    </div>
  )
}
