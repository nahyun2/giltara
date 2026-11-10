import type { PlaceCategory } from '../types/course'

export type IconName = PlaceCategory | 'check' | 'pin' | 'arrow' | 'tv' | 'logo'

/* 24x24 선 아이콘. 항상 글자 라벨과 함께 쓰므로 화면 읽기 프로그램에서는 숨긴다. */
const PATHS: Record<IconName, string> = {
  market: 'M3 9l1.5-5h15L21 9M3 9h18M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M5 12v8h14v-8M10 20v-5h4v5',
  food: 'M4 12h16a8 8 0 01-16 0zM9 4l3 6M15 4l-1 6',
  nature: 'M12 3l6 9h-4l4 6H6l4-6H6l6-9zM12 18v3',
  culture: 'M3 8l9-5 9 5M5 8v2h14V8M6 10v9M10 10v9M14 10v9M18 10v9M3 21h18',
  cafe: 'M4 8h13v5a6 6 0 01-6 6h-1a6 6 0 01-6-6V8zM17 9h1.5a2.5 2.5 0 010 5H17M8 3v2M12 3v2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  pin: 'M12 21s-6-5.4-6-11a6 6 0 0112 0c0 5.6-6 11-6 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  tv: 'M3 7h18v12H3zM8 3l4 4 4-4',
  logo: 'M4 20c4-1 6-4 8-8s4-7 8-8M6 9l2-4 2 4M6 9h4M8 9v3',
}

type Props = {
  name: IconName
  className?: string
}

export default function Icon({ name, className = 'size-6' }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
