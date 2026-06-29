/**
 * Working Group prototype: interleaved reasoning beats + the same read-only shell commands as **Prototype**.
 * Paragraph slices reference {@link REASONING_BODY_PARAGRAPHS} indices `[paraFrom, paraTo)`.
 */
import { REASONING_BODY_PARAGRAPHS } from './ThinkingWgReasoningConstants'

export type MixedReasoningStep = {
  kind: 'reasoning'
  /** One-line label in step list / feed cards */
  title: string
  paraFrom: number
  paraTo: number
}

export type MixedToolcallStep = { kind: 'toolcall'; cmdIndex: number }

export type MixedStep = MixedReasoningStep | MixedToolcallStep

/**
 * Four thinking beats separated by terminal commands — reflects “plan → try commands → reassess” loops.
 * Uses all 11 mock commands from the Thinking WG panel (`READONLY_TOOLCALLS`) in order.
 */
export const WORKING_MIXED_STEPS: MixedStep[] = [
  {
    kind: 'reasoning',
    title: 'Scoping the failing slice—not noise from the whole Spring graph',
    paraFrom: 0,
    paraTo: 3,
  },
  { kind: 'toolcall', cmdIndex: 11 },
  { kind: 'toolcall', cmdIndex: 0 },
  { kind: 'toolcall', cmdIndex: 1 },
  {
    kind: 'reasoning',
    title: 'Boot slice: starters, security-test, and where wiring usually stops',
    paraFrom: 3,
    paraTo: 6,
  },
  { kind: 'toolcall', cmdIndex: 2 },
  { kind: 'toolcall', cmdIndex: 3 },
  {
    kind: 'reasoning',
    title: 'Port contention vs JDBC — blame order before rerunning the matrix',
    paraFrom: 6,
    paraTo: 9,
  },
  { kind: 'toolcall', cmdIndex: 4 },
  { kind: 'toolcall', cmdIndex: 5 },
  { kind: 'toolcall', cmdIndex: 6 },
  {
    kind: 'reasoning',
    title: 'Compose network names vs localhost — align yml before widening smoke',
    paraFrom: 9,
    paraTo: 12,
  },
  { kind: 'toolcall', cmdIndex: 7 },
  { kind: 'toolcall', cmdIndex: 8 },
  { kind: 'toolcall', cmdIndex: 9 },
  { kind: 'toolcall', cmdIndex: 10 },
]

export const WORKING_MIXED_STEP_COUNT = WORKING_MIXED_STEPS.length

const TOOLCALL_BASE_MS = [1900, 2200, 1200, 2600, 1500, 1800, 1100, 2400, 1700, 1600, 1400, 2000]

function streamJitterFactor(streamSeed: number, salt: number): number {
  let h = Math.imul(streamSeed ^ salt, 0xcc9e2d51)
  h ^= h >>> 16
  h = Math.imul(h, 0x1b873593)
  h ^= h >>> 13
  const t = (h >>> 0) % 1000 / 1000
  return 0.62 + t * 0.76
}

/**
 * Per-step duration for the mixed Working Group trace.
 * @param streamSeed — pass a random per-mount seed (e.g. from `useState(() => random())`) so command/reasoning beats
 *   feel less uniform on each Restart; use `0` for stable baseline totals.
 */
export function mixedStepDurationMs(step: MixedStep, streamSeed = 0): number {
  let base: number
  if (step.kind === 'toolcall') {
    base = TOOLCALL_BASE_MS[step.cmdIndex] ?? 2000
  } else {
    const n = Math.max(1, step.paraTo - step.paraFrom)
    base = Math.min(3400, 950 + n * 520)
  }
  if (!streamSeed) return base
  const salt = step.kind === 'toolcall' ? step.cmdIndex * 101 : step.paraFrom * 1009
  return Math.max(480, Math.round(base * streamJitterFactor(streamSeed, salt)))
}

/** Scripted mixed trace length (ms) — baseline (no jitter) for docs / static estimates. */
export const WORKING_MIXED_STREAM_TOTAL_MS = WORKING_MIXED_STEPS.reduce((acc, s) => acc + mixedStepDurationMs(s, 0), 0)

export const WORKING_MIXED_STREAM_SECONDS = Math.max(1, Math.round(WORKING_MIXED_STREAM_TOTAL_MS / 1000))

if (import.meta.env.DEV) {
  for (const s of WORKING_MIXED_STEPS) {
    if (s.kind !== 'reasoning') continue
    if (s.paraFrom < 0 || s.paraTo > REASONING_BODY_PARAGRAPHS.length || s.paraFrom >= s.paraTo) {
      // eslint-disable-next-line no-console -- dev-only invariant
      console.warn('ThinkingWgMixedSequence: invalid paragraph slice', s)
    }
  }
}
