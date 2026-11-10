import { useEffect, useRef, useState } from 'react'
import Icon, { type IconName } from './Icon'

type Props = {
  /** 칩 줄 위에 보이는 제목 (예: "방송 프로그램") */
  label: string
  icon: IconName
  options: string[]
  /** null이면 "전체"가 선택된 상태 */
  selected: string | null
  onChange: (value: string | null) => void
}

const ALL_LABEL = '전체'

export default function FilterChips({ label, icon, options, selected, onChange }: Props) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [isScrollable, setIsScrollable] = useState(false)

  // 칩이 화면 너비를 넘칠 때만 "좌우로 밀어 보세요" 안내를 보여준다
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const check = () => setIsScrollable(row.scrollWidth > row.clientWidth)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(row)
    return () => observer.disconnect()
  }, [options])

  const items: { key: string; text: string; value: string | null }[] = [
    { key: '__all__', text: ALL_LABEL, value: null },
    ...options.map((option) => ({ key: option, text: option, value: option })),
  ]

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-body font-bold text-text">
          <Icon name={icon} className="size-6 text-primary" />
          {label}
        </p>
        {isScrollable && (
          <p className="flex items-center gap-1 text-caption text-text-sub">
            좌우로 밀어 보세요
            <Icon name="arrow" className="size-5" />
          </p>
        )}
      </div>
      {/* 화면 양 끝까지 닿게 해서, 잘린 칩으로 더 있다는 것을 보여준다 */}
      <div
        ref={rowRef}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isSelected = item.value === selected
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(item.value)}
              className={[
                'inline-flex min-h-touch shrink-0 items-center gap-1.5 rounded-xl px-5 text-body font-medium whitespace-nowrap',
                'transition-transform active:scale-95',
                'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-primary-dark',
                isSelected ? 'bg-primary font-bold text-on-color shadow-md' : 'bg-chip text-text',
              ].join(' ')}
            >
              {isSelected && <Icon name="check" className="size-5" />}
              {item.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
