import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'

/** Scroll parents — same idea as kit `Tooltip` (repositions / hides on nested scroll). */
function getScrollParents(el: Element | null) {
  const parents: (Element | Window)[] = []
  if (!el) {
    parents.push(window)
    return parents
  }
  let node: HTMLElement | null = el.parentElement
  while (node) {
    const { overflow, overflowX, overflowY } = window.getComputedStyle(node)
    const ox = `${overflow} ${overflowX} ${overflowY}`
    if (/(auto|scroll|overlay)/.test(ox)) {
      parents.push(node)
    }
    node = node.parentElement
  }
  parents.push(window)
  return parents
}

/** Hover/fixed rich tooltip (prototype) — mirrors kit `Tooltip` timing & positioning for non-string content. */
export function AiaHoverRichTip({
  children,
  content,
  placement = 'bottom',
  delay = 500,
  autoHideMs,
  enabled = true,
  asBlock = false,
  triggerClassName = '',
  tooltipClassName = 'figma-ai-tw__aiaMcpJsonTooltip',
}: {
  children: ReactNode
  content: ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  /** Hide automatically after this many ms (e.g. overflow command preview). */
  autoHideMs?: number
  enabled?: boolean
  /** Use `div` trigger — required when wrapping block-level command lines. */
  asBlock?: boolean
  triggerClassName?: string
  tooltipClassName?: string
}) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLSpanElement | HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current)
      autoHideRef.current = null
    }
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return
    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const gap = 4
    const isOutOfView =
      triggerRect.bottom < 0 ||
      triggerRect.top > window.innerHeight ||
      triggerRect.right < 0 ||
      triggerRect.left > window.innerWidth
    if (isOutOfView) {
      setVisible(false)
      return
    }
    let top = 0
    let left = 0
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.left - tooltipRect.width - gap
        break
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2
        left = triggerRect.right + gap
        break
      default:
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
    }
    setPosition({ top, left })
  }, [placement])

  useLayoutEffect(() => {
    if (!visible) return undefined
    updatePosition()
    let rafId = 0
    const schedulePosition = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        updatePosition()
      })
    }
    window.addEventListener('resize', schedulePosition)
    const scrollTargets = getScrollParents(triggerRef.current)
    scrollTargets.forEach((target) => {
      target.addEventListener('scroll', schedulePosition, { passive: true })
    })
    return () => {
      window.removeEventListener('resize', schedulePosition)
      scrollTargets.forEach((target) => {
        target.removeEventListener('scroll', schedulePosition)
      })
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [visible, placement, updatePosition])

  const handleEnter = () => {
    if (!enabled) return
    clearTimers()
    timeoutRef.current = setTimeout(() => {
      setVisible(true)
      if (autoHideMs) {
        autoHideRef.current = setTimeout(() => setVisible(false), autoHideMs)
      }
    }, delay)
  }

  const handleLeave = () => {
    clearTimers()
    setVisible(false)
  }

  useEffect(() => () => clearTimers(), [clearTimers])

  const triggerProps = {
    className: ['tooltip-trigger', 'figma-ai-tw__aiaMcpTipTrigger', triggerClassName]
      .filter(Boolean)
      .join(' '),
    ref: triggerRef as RefObject<HTMLSpanElement & HTMLDivElement>,
    onMouseEnter: handleEnter,
    onMouseLeave: handleLeave,
  }

  const tooltipNode = visible ? (
    <div
      ref={tooltipRef}
      className={tooltipClassName}
      style={{ top: position.top, left: position.left }}
      role="tooltip"
    >
      {content}
    </div>
  ) : null

  return asBlock ? (
    <div {...triggerProps}>
      {children}
      {tooltipNode}
    </div>
  ) : (
    <span {...triggerProps}>
      {children}
      {tooltipNode}
    </span>
  )
}

const AIA_CMD_OVERFLOW_TIP_DELAY_MS = 550
const AIA_CMD_OVERFLOW_TIP_VISIBLE_MS = 1600

/** Command line in feed — shows a short rich tooltip when the line is truncated. */
export function AiaSnippetCmdLine({
  className = '',
  mono,
  highlight,
  children,
}: {
  className?: string
  /** Full command string for overflow measurement and plain tooltip fallback. */
  mono: string
  /** Syntax-highlighted command for inline row and tooltip body. */
  highlight?: ReactNode
  /** Optional row body (status labels, Run prefix, MCP args button, …). */
  children?: ReactNode
}) {
  const cmdRef = useRef<HTMLParagraphElement>(null)
  const [overflows, setOverflows] = useState(false)

  const body = children ?? highlight ?? <span className="m">{mono}</span>
  const tooltipBody = highlight ?? <span className="m">{mono}</span>

  const syncOverflow = useCallback(() => {
    const el = cmdRef.current
    if (!el) return
    setOverflows(el.scrollWidth > el.clientWidth + 1)
  }, [])

  useLayoutEffect(() => {
    syncOverflow()
    const el = cmdRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(syncOverflow)
    ro.observe(el)
    const scrollTargets = getScrollParents(el)
    scrollTargets.forEach((target) => {
      target.addEventListener('scroll', syncOverflow, { passive: true })
    })
    window.addEventListener('resize', syncOverflow)
    return () => {
      ro.disconnect()
      scrollTargets.forEach((target) => {
        target.removeEventListener('scroll', syncOverflow)
      })
      window.removeEventListener('resize', syncOverflow)
    }
  }, [syncOverflow, mono, children])

  const cmdLine = (
    <p ref={cmdRef} className={className}>
      {body}
    </p>
  )

  if (!overflows) return cmdLine

  return (
    <AiaHoverRichTip
      asBlock
      enabled
      delay={AIA_CMD_OVERFLOW_TIP_DELAY_MS}
      autoHideMs={AIA_CMD_OVERFLOW_TIP_VISIBLE_MS}
      placement="bottom"
      triggerClassName="figma-ai-tw__aiaCmdOverflowTipTrigger"
      tooltipClassName="figma-ai-tw__aiaCmdOverflowTooltip"
      content={<div className="figma-ai-tw__aiaCmdOverflowTooltipInner">{tooltipBody}</div>}
    >
      {cmdLine}
    </AiaHoverRichTip>
  )
}
