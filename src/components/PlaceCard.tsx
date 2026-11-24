import { useId } from 'react'
import { PLACE_CATEGORY_LABEL, type Place } from '../types/course'
import Icon from './Icon'

type Props = {
  place: Place
}

const SUB_BUTTON =
  'flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-body font-bold text-primary transition-colors hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]'

/** 코스 상세의 장소 카드: 순서 번호, 장소명, 유형·주소, 전화하기·카카오맵 버튼 */
export default function PlaceCard({ place }: Props) {
  const nameId = useId()
  // 카카오가 http 주소를 주므로 https로 연다
  const placeUrl = place.placeUrl?.replace(/^http:/, 'https:')
  const buttonCount = (place.phone ? 1 : 0) + (placeUrl ? 1 : 0)

  return (
    <article
      aria-labelledby={nameId}
      className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
          {place.order}
          <span className="sr-only">번째</span>
        </span>
        <h3 id={nameId} className="text-card-title font-bold text-text">
          {place.name}
        </h3>
      </div>

      <p className="flex flex-wrap items-center gap-x-1.5 text-caption text-text-sub">
        <Icon name={place.category} className="size-5 text-primary" />
        <span>{PLACE_CATEGORY_LABEL[place.category]}</span>
        <span aria-hidden="true">·</span>
        <span>{place.address ?? place.district}</span>
      </p>

      {buttonCount > 0 && (
        <div className={`grid gap-2.5 ${buttonCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {place.phone && (
            <a href={`tel:${place.phone}`} aria-describedby={nameId} className={SUB_BUTTON}>
              <Icon name="phone" className="size-5" />
              전화하기
            </a>
          )}
          {placeUrl && (
            <a
              href={placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-describedby={nameId}
              className={SUB_BUTTON}
            >
              <Icon name="map" className="size-5" />
              카카오맵에서 보기
            </a>
          )}
        </div>
      )}
    </article>
  )
}
