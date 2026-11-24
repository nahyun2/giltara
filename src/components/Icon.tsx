import type { PlaceCategory } from '../types/course'

export type IconName =
  | PlaceCategory
  | 'check'
  | 'pin'
  | 'arrow'
  | 'back'
  | 'phone'
  | 'map'
  | 'calendar'
  | 'people'
  | 'car'
  | 'bus'
  | 'wheelchair'
  | 'paw'
  | 'tv'
  | 'logo'

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
  back: 'M19 12H5M11 6l-6 6 6 6',
  phone:
    'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  people: 'M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M16 11a2.5 2.5 0 100-5M17 14a5 5 0 014 6',
  car: 'M4 16V12l2-5h12l2 5v4zM4 12h16M4 16v3h3v-3M17 16v3h3v-3M7.5 14h.01M16.5 14h.01',
  bus: 'M6 3h12a2 2 0 012 2v12H4V5a2 2 0 012-2zM4 11h16M7 17v3M17 17v3M8 14h.01M16 14h.01',
  wheelchair:
    'M11 4a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0M12 7v6h5l2 5M12 10h4M9.5 11.5a5 5 0 106 6',
  paw: 'M6.5 9.5a1.5 2 0 103 0 1.5 2 0 10-3 0M14.5 9.5a1.5 2 0 103 0 1.5 2 0 10-3 0M3.5 13.5a1.3 1.6 0 102.6 0 1.3 1.6 0 10-2.6 0M17.9 13.5a1.3 1.6 0 102.6 0 1.3 1.6 0 10-2.6 0M12 13c-3 0-5 3.5-4 5s2.5 1 4 1 3 .5 4-1-1-5-4-5z',
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
