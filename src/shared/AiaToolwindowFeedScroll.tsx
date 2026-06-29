import {
  createContext,
  useCallback,
  useContext,
  type MutableRefObject,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { AIA_CMD_EXPAND_REVEAL_MS } from './AiaCmdExpandReveal'

/** Extra grace after reveal animation before the feed may auto-pin to bottom again. */
export const AIA_FEED_SCROLL_PIN_GRACE_MS = 80

/** Thinking/Working #0 CP peek ↔ full — longer than cmd log grid reveal (large trace un-caps). */
export const AIA_CP_BODY_EXPAND_REVEAL_MS = 400

type FeedScrollContextValue = {
  scrollRef: RefObject<HTMLDivElement | null>
  suppressFeedScrollPinUntilRef: MutableRefObject<number>
}

const AiaToolwindowFeedScrollContext = createContext<FeedScrollContextValue | null>(null)

export function AiaToolwindowFeedScrollProvider({
  scrollRef,
  suppressFeedScrollPinUntilRef,
  children,
}: FeedScrollContextValue & { children: ReactNode }) {
  return (
    <AiaToolwindowFeedScrollContext.Provider value={{ scrollRef, suppressFeedScrollPinUntilRef }}>
      {children}
    </AiaToolwindowFeedScrollContext.Provider>
  )
}

export function useAiaToolwindowFeedScroll() {
  return useContext(AiaToolwindowFeedScrollContext)
}

/** Keep the anchor row fixed in the feed viewport while new content opens below it. */
export function anchorFeedGrowthDown(
  scroller: HTMLElement | null,
  suppressFeedScrollPinUntilRef: MutableRefObject<number>,
  anchorEl: HTMLElement | null,
  onToggle: () => void,
  revealMs = AIA_CMD_EXPAND_REVEAL_MS,
) {
  let targetOffset: number | null = null
  if (scroller && anchorEl) {
    targetOffset = anchorEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top
  }

  const suppressUntil = performance.now() + revealMs + AIA_FEED_SCROLL_PIN_GRACE_MS
  suppressFeedScrollPinUntilRef.current = suppressUntil
  onToggle()

  if (!scroller || !anchorEl || targetOffset == null) return

  const compensate = () => {
    const currentOffset = anchorEl.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    const delta = currentOffset - targetOffset!
    if (Math.abs(delta) > 0.5) {
      scroller.scrollTop += delta
    }
  }

  const started = performance.now()
  let rafId = 0

  const tick = () => {
    compensate()
    if (performance.now() - started < revealMs) {
      rafId = requestAnimationFrame(tick)
    }
  }

  rafId = requestAnimationFrame(() => {
    rafId = requestAnimationFrame(tick)
  })

  const snippet = anchorEl.closest('.figma-ai-tw__snippet')
  const ro = new ResizeObserver(() => {
    if (performance.now() < suppressUntil) compensate()
  })
  if (snippet) ro.observe(snippet)

  window.setTimeout(() => {
    cancelAnimationFrame(rafId)
    ro.disconnect()
    compensate()
  }, revealMs + 32)
}

export function useFeedExpandAnchor(defaultRevealMs = AIA_CMD_EXPAND_REVEAL_MS) {
  const ctx = useAiaToolwindowFeedScroll()

  const anchorToggle = useCallback(
    (
      event: ReactMouseEvent<HTMLElement>,
      toggle: () => void,
      anchorEl?: HTMLElement | null,
      revealMs = defaultRevealMs,
    ) => {
      event.stopPropagation()
      if (!ctx) {
        toggle()
        return
      }
      const anchor =
        anchorEl ??
        (event.currentTarget.closest('.figma-ai-tw__snippet')?.querySelector('.figma-ai-tw__snippetHeader') as
          | HTMLElement
          | null) ??
        event.currentTarget
      anchorFeedGrowthDown(ctx.scrollRef.current, ctx.suppressFeedScrollPinUntilRef, anchor, toggle, revealMs)
    },
    [ctx, defaultRevealMs],
  )

  return anchorToggle
}
