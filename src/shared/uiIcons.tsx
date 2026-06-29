import { useId, type SVGProps } from 'react'

const s = (props: SVGProps<SVGSVGElement>) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  ...props,
})

/** 16×16 UI icons — replace with your SVGs from Figma export if needed (drop into `public/ai-toolwindow-icons/`). */
export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconClock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 5v3.25L10 10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function IconMoreVertical(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <circle cx="8" cy="3" r="1.25" fill="currentColor" />
      <circle cx="8" cy="8" r="1.25" fill="currentColor" />
      <circle cx="8" cy="13" r="1.25" fill="currentColor" />
    </svg>
  )
}

export function IconHide(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function IconCheckSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M3.5 8.2 6.4 11 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconBanSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5 11l6-6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

export function IconWarningSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M8 3.25 12.75 12H3.25L8 3.25Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d="M8 6.25v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="10.75" r="0.65" fill="currentColor" />
    </svg>
  )
}

/** Small X — failed / not completed (toolcall rows). */
export function IconCrossSmall(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  )
}

export function IconChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Arrow up for approval shortcut hint (composer → options). */
export function IconArrowUpShortcut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
      {...props}
    >
      <path
        d="M6 9.25V3M3.25 5.25L6 2.75l2.75 2.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Arrow down for approval shortcut hint (options list navigation). */
export function IconArrowDownShortcut(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
      {...props}
    >
      <path
        d="M6 2.75v6.5M3.25 6.75L6 9.25l2.75-2.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconTerminal(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M3.5 4.5h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <path d="M5 7.5l2 1.5-2 1.5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 10.5H11" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
    </svg>
  )
}

/** Two overlapping squares — copy on hover in expanded command blocks. */
export function IconCopy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <rect x="5.5" y="5.5" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.15" />
      <path
        d="M4.5 10.5V4.5a1 1 0 0 1 1-1H10"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconOpenInWindow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M6 3.5H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2M10 3.5h2.5V6M9 7l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevronsUpDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path d="M5 5l1.2-1.2L7.4 5M5 11l1.2 1.2L7.4 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconSend(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M3 9 12.5 4 8 8l4.5 4L3 9Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconAttach(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...s(props)}>
      <path
        d="M10.5 4.5l-5.2 5.2a2 2 0 1 0 2.8 2.8l5-5a2.7 2.7 0 0 0-3.8-3.8l-5 5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconSparkAgent(props: SVGProps<SVGSVGElement>) {
  const gid = `spark-${useId().replace(/:/g, '')}`
  const href = `url(#${gid})`
  return (
    <svg {...s(props)}>
      <path
        d="M8 2.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"
        fill={href}
        stroke="#e07a3a"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient id={gid} x1="4" y1="3" x2="12" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffb86a" />
          <stop offset="1" stopColor="#e07a3a" />
        </linearGradient>
      </defs>
    </svg>
  )
}
