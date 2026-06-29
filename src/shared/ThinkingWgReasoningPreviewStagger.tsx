import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import {
  REASONING_PREVIEW_DEBOUNCE_FIRST_MS,
  REASONING_PREVIEW_DEBOUNCE_MS,
  REASONING_PREVIEW_DEBOUNCE_SHORT_MS,
  REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE,
  REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS,
  REASONING_PREVIEW_WORD_STAGGER_MS,
  getReasoningPreviewLastLines,
} from './ThinkingWgReasoningConstants'

function flattenPreviewForDisplay(joined: string): string {
  return joined.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim()
}

export type ThinkingWgReasoningPreviewStaggerProps = {
  paragraphCount: number
  /** Skip staged animation; show live tail (still debounced lightly for stability). */
  reducedMotion?: boolean
  /**
   * TWG **`summaryPreview`** + `panelKind="reasoning"`: while `streamingPhase === 'revealing'`, drive preview from
   * {@link REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE} on a fixed clock ({@link REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS} between beats).
   */
  reasoningPreviewSnapshotCycle?: boolean
  streamingPhase?: 'revealing' | 'summary' | 'expanded'
}

/**
 * TWG reasoning preview: debounced tail (optional snapshot “beats” while `revealing`), then one
 * **paragraph** of tail copy — wraps with the tool window width, **max three lines**, ellipsis if clipped
 * (`-webkit-line-clamp`). On each new tail string, visible copy **reveals word-by-word** (cadence from
 * {@link REASONING_PREVIEW_WORD_STAGGER_MS}; disabled under `prefers-reduced-motion`). `aria-live` announces the **full**
 * flattened snapshot only once typing completes so SR users are not spammed per word.
 */
export function ThinkingWgReasoningPreviewStagger({
  paragraphCount,
  reducedMotion = false,
  reasoningPreviewSnapshotCycle = false,
  streamingPhase = 'revealing',
}: ThinkingWgReasoningPreviewStaggerProps) {
  const [snapshotTier, setSnapshotTier] = useState(0)

  useEffect(() => {
    if (!reasoningPreviewSnapshotCycle || reducedMotion || streamingPhase !== 'revealing') {
      setSnapshotTier(0)
      return
    }
    setSnapshotTier(0)
    const seq = REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE
    const step = REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS
    const timers: number[] = []
    for (let i = 1; i < seq.length; i++) {
      timers.push(window.setTimeout(() => setSnapshotTier(i), i * step))
    }
    return () => {
      for (const t of timers) window.clearTimeout(t)
    }
  }, [reasoningPreviewSnapshotCycle, reducedMotion, streamingPhase])

  const effectiveParagraphCount = useMemo(() => {
    if (reasoningPreviewSnapshotCycle && streamingPhase === 'revealing') {
      const seq = REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE
      const i = Math.min(snapshotTier, seq.length - 1)
      return seq[i] ?? paragraphCount
    }
    return paragraphCount
  }, [reasoningPreviewSnapshotCycle, streamingPhase, snapshotTier, paragraphCount])

  const liveText = useMemo(
    () => getReasoningPreviewLastLines(effectiveParagraphCount),
    [effectiveParagraphCount],
  )

  const [debouncedText, setDebouncedText] = useState(liveText)
  useEffect(() => {
    if (reducedMotion) {
      setDebouncedText(liveText)
      return
    }
    if (reasoningPreviewSnapshotCycle && streamingPhase === 'revealing') {
      setDebouncedText(liveText)
      return
    }
    const compact = liveText.replace(/\s/g, '').length < 28
    const ms =
      paragraphCount <= 1
        ? REASONING_PREVIEW_DEBOUNCE_FIRST_MS
        : compact
          ? REASONING_PREVIEW_DEBOUNCE_SHORT_MS
          : REASONING_PREVIEW_DEBOUNCE_MS
    const t = window.setTimeout(() => setDebouncedText(liveText), ms)
    return () => window.clearTimeout(t)
  }, [liveText, paragraphCount, reducedMotion, reasoningPreviewSnapshotCycle, streamingPhase])

  const displayDebounced = useMemo(() => flattenPreviewForDisplay(debouncedText), [debouncedText])
  const displayLive = useMemo(() => flattenPreviewForDisplay(liveText), [liveText])

  const display = reducedMotion ? displayLive : displayDebounced

  const words = useMemo(() => (display ? display.split(' ') : []), [display])

  const [visibleWordCount, setVisibleWordCount] = useState(0)

  useLayoutEffect(() => {
    if (reducedMotion) {
      setVisibleWordCount(words.length)
      return
    }
    setVisibleWordCount(words.length > 0 ? 1 : 0)
  }, [display, reducedMotion, words.length])

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return
    let shown = 1
    const id = window.setInterval(() => {
      shown += 1
      if (shown > words.length) {
        window.clearInterval(id)
        return
      }
      setVisibleWordCount(shown)
      if (shown >= words.length) window.clearInterval(id)
    }, REASONING_PREVIEW_WORD_STAGGER_MS)
    return () => window.clearInterval(id)
  }, [display, reducedMotion, words.length])

  const visibleText = useMemo(() => {
    if (reducedMotion || words.length === 0) return display
    return words.slice(0, visibleWordCount).join(' ')
  }, [display, reducedMotion, visibleWordCount, words])

  const typingComplete = reducedMotion || words.length === 0 || visibleWordCount >= words.length

  return (
    <div className="figma-ai-tw__thinkingWgPreviewReasoningAnim">
      <span className="figma-ai-tw__thinkingWgPreviewSrLive" aria-live="polite">
        {typingComplete ? display : ''}
      </span>
      <p
        className="figma-ai-tw__thinkingWgPreviewReasoning figma-ai-tw__thinkingWgPreviewReasoningClamp"
        aria-hidden
      >
        {visibleText}
      </p>
    </div>
  )
}
