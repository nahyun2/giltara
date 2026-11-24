import type { ReactNode } from 'react'
import Icon, { type IconName } from './Icon'

type Props = {
  selected: boolean
  onClick: () => void
  icon?: IconName
  children: ReactNode
}

/** 조건 입력의 선택지 버튼. 고르면 초록 배경 + 체크 표시 */
export default function ChoiceButton({ selected, onClick, icon, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-button w-full items-center gap-3 rounded-xl border-2 px-4 py-2 text-left text-button font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark ${
        selected
          ? 'border-primary bg-primary text-on-color'
          : 'border-chip bg-card text-text hover:border-primary'
      }`}
    >
      {icon && <Icon name={icon} className="size-6 shrink-0" />}
      <span className="flex-1">{children}</span>
      {selected && <Icon name="check" className="size-6 shrink-0" />}
    </button>
  )
}
