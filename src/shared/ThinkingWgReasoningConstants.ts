/** Scripted reasoning stream length in ms (timing only; collapsed summary shows `REASONING_STREAM_SECTION_HEADLINE`, not a raw timer). */
export const REASONING_STREAM_MS = 9000

export const REASONING_THOUGHT_SECONDS = Math.max(1, Math.round(REASONING_STREAM_MS / 1000))

/**
 * Uneven paragraph lengths + irregular reveal times — reads like thinking in bursts, not fixed 4–5 line chunks.
 * `REASONING_PARAGRAPH_REVEAL_AT_MS[i]` = ms from stream start when paragraph `i` mounts (monotonic, last &lt; `REASONING_STREAM_MS`).
 */
export const REASONING_BODY_PARAGRAPHS: readonly string[] = [
  'Before Gradle: I want the failing slice of the context graph—not noise from the whole graph.',
  'Boot slice first: `@SpringBootTest` ↔ `ApplicationContext`, whether starter-test already pulls `spring-security-test`, and where wiring stops—usually a missing `@Import` or a CI profile that never flips on.',
  'Teams trim `spring-security-test` first; “random” reds are often just filters that never loaded.',
  'Check both Gradle and Maven wrappers in repo root, then align `JAVA_HOME` with what the IDE used for the same compile.',
  'Port drama gets blamed before JDBC—almost always.',
  '`8080` is shared between actuator smoke and the long Gradle target—`lsof` right before rerun. Another process on the port makes health flap; the suite looks flaky when it is just contention.',
  'Same host string, wrong compose network name from inside the container—a classic false negative.',
  'Cross-read `application.yml` and `docker-compose.yml`: JDBC host must match the internal service name, not `localhost` from a sibling container.',
  'DialKit discipline: every THINKING-WG page id stays in `VALID_PAGES` or the shell bounces to overview—like wiring you only notice when half the suite vanishes.',
  'If a filter is debug-only, gate it behind endpoint visibility or sampled logs in prod.',
  'After a green compile without tests: narrow smoke—health plus one read-only API—then widen once ports and datasource agree.',
  'Pausing so timers and ports breathe before the full matrix.',
]

/**
 * Single section theme for the whole reasoning block (feed + list + summary shimmer while streaming).
 * Stays fixed for the entire `revealing` phase — body paragraphs elaborate under this umbrella.
 */
export const REASONING_STREAM_SECTION_HEADLINE = 'Tracing a flaky Spring test run end to end'

/** `#0` current-production **Working Group** mixed CP card: header while the scripted stream is still running. */
export const REASONING_CP_PROGRESS_HEADLINE = 'Working'

/** `#0` current-production **Thinking Group** reasoning CP only — same card shape, “thinking” voice. */
export const REASONING_CP_THINKING_GROUP_PROGRESS_HEADLINE = 'Thinking'

/** `#0` Working Group mixed CP: resolved header after the stream (`seconds` from mixed total). */
export function formatReasoningCpCompletedHeadline(seconds: number): string {
  return `Worked for ${seconds}s`
}

/** `#0` Thinking Group reasoning CP: resolved header after the stream. */
export function formatReasoningCpThinkingGroupCompletedHeadline(seconds: number): string {
  return `Thought for ${seconds}s`
}

export const REASONING_PARAGRAPH_COUNT = REASONING_BODY_PARAGRAPHS.length

export const REASONING_PARAGRAPH_REVEAL_AT_MS: readonly number[] = [
  658, 1419, 2042, 2908, 3483, 4258, 4829, 5608, 6242, 7062, 7650, 8417,
]

if (import.meta.env.DEV) {
  if (REASONING_PARAGRAPH_REVEAL_AT_MS.length !== REASONING_PARAGRAPH_COUNT) {
    // eslint-disable-next-line no-console -- dev-only invariant
    console.warn(
      'ThinkingWgReasoningConstants: REASONING_PARAGRAPH_REVEAL_AT_MS length must match REASONING_BODY_PARAGRAPHS',
    )
  }
  const last = REASONING_PARAGRAPH_REVEAL_AT_MS[REASONING_PARAGRAPH_REVEAL_AT_MS.length - 1]
  if (last != null && last >= REASONING_STREAM_MS) {
    // eslint-disable-next-line no-console -- dev-only invariant
    console.warn('ThinkingWgReasoningConstants: last reveal time must be < REASONING_STREAM_MS')
  }
}

export const REASONING_BODY_TEXT = REASONING_BODY_PARAGRAPHS.join(' ')

/** ~characters per wrapped line in narrow #3 preview column (heuristic for “last 3 lines”). */
export const REASONING_PREVIEW_APPROX_CHARS_PER_LINE = 54

/** WG #0 CP in-progress: cadence for word-by-word reasoning reveal (natural wrap, resize-safe). */
export const MIXED_CP_REASONING_WORD_REVEAL_MS = 38

export const REASONING_PREVIEW_LAST_LINE_COUNT = 3

/** #2 / #3 preview: wait after `paragraphCount` moves before swapping tail copy so the user can read the current tail. */
export const REASONING_PREVIEW_DEBOUNCE_MS = 1650

/** Short debounce when only the first chunk exists so the preview is not blank for long. */
export const REASONING_PREVIEW_DEBOUNCE_FIRST_MS = 320

/** Short debounce when joined preview text is still tiny. */
export const REASONING_PREVIEW_DEBOUNCE_SHORT_MS = 520

/**
 * TWG reasoning summary preview (`reasoningPreviewSnapshotCycle`): **two** fixed paragraph cutoffs — first tail,
 * then **one** step to a later tail — on {@link REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS} after `revealing` starts.
 */
export const REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE: readonly number[] = [4, 11]

/** @deprecated Use {@link REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE} (legacy triple; third repeats last cutoff). */
export const REASONING_PREVIEW_REASONING_SNAPSHOT_PARAGRAPHS: readonly [number, number, number] = [
  REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE[0]!,
  REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE[1]!,
  REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE[REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE.length - 1]!,
]

/** Ms between reasoning preview snapshot steps while `revealing`: dwell on each tail before the next swap. */
export const REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS = 1700

if (import.meta.env.DEV) {
  const snapshotSpan =
    (REASONING_PREVIEW_REASONING_SNAPSHOT_SEQUENCE.length - 1) * REASONING_PREVIEW_REASONING_SNAPSHOT_STEP_MS
  if (snapshotSpan >= REASONING_STREAM_MS) {
    // eslint-disable-next-line no-console -- dev-only invariant
    console.warn(
      'ThinkingWgReasoningConstants: snapshot sequence span must be < REASONING_STREAM_MS (raise stream or shorten sequence / step)',
    )
  }
}

/** Reasoning preview: ms between revealing each word when the debounced tail (or snapshot beat) changes. */
export const REASONING_PREVIEW_WORD_STAGGER_MS = 44

/** Short excerpt for summary-preview row while streaming (#3) — full flattened body when `paragraphCount` ≥ length. */
export function getReasoningPreviewExcerptThrough(paragraphCount: number, maxChars = 200): string {
  const n = Math.max(0, Math.min(REASONING_PARAGRAPH_COUNT, Math.floor(paragraphCount)))
  const slice = REASONING_BODY_PARAGRAPHS.slice(0, n)
  const t = slice.join(' ').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  if (t.length <= maxChars) return t
  return `${t.slice(0, maxChars).trim()}…`
}

/**
 * #3 reasoning preview: last `REASONING_PREVIEW_LAST_LINE_COUNT` logical lines of visible copy (word-wrapped
 * heuristically to `REASONING_PREVIEW_APPROX_CHARS_PER_LINE`). No leading/trailing ellipsis.
 */
export function wrapWordsToApproxLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  const lines: string[] = []
  let cur = ''
  for (const w of words) {
    const candidate = cur ? `${cur} ${w}` : w
    if (candidate.length > maxCharsPerLine && cur) {
      lines.push(cur)
      cur = w
      while (cur.length > maxCharsPerLine) {
        lines.push(cur.slice(0, maxCharsPerLine))
        cur = cur.slice(maxCharsPerLine)
      }
    } else {
      cur = candidate
    }
  }
  if (cur) lines.push(cur)
  return lines
}

export function getReasoningPreviewLastLines(
  paragraphCount: number,
  maxCharsPerLine = REASONING_PREVIEW_APPROX_CHARS_PER_LINE,
  lineCount = REASONING_PREVIEW_LAST_LINE_COUNT,
): string {
  const n = Math.max(0, Math.min(REASONING_PARAGRAPH_COUNT, Math.floor(paragraphCount)))
  const slice = REASONING_BODY_PARAGRAPHS.slice(0, n)
  const t = slice.join(' ').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  const lines = wrapWordsToApproxLines(t, maxCharsPerLine)
  if (lines.length <= lineCount) return lines.join('\n')
  return lines.slice(-lineCount).join('\n')
}

/** Split {@link getReasoningPreviewLastLines} output into exactly three rows (pad with `''`). */
export function splitReasoningPreviewIntoThreeRows(joined: string): readonly [string, string, string] {
  if (!joined.trim()) return ['', '', ''] as const
  const parts = joined.split('\n')
  const n = parts.length
  if (n >= 3) return [parts[n - 3]!, parts[n - 2]!, parts[n - 1]!] as const
  if (n === 2) return ['', parts[0]!, parts[1]!] as const
  return ['', '', parts[0]!] as const
}

/** Short excerpt for static / full states. */
export function getReasoningPreviewExcerpt(maxChars = 200): string {
  return getReasoningPreviewExcerptThrough(REASONING_PARAGRAPH_COUNT, maxChars)
}
