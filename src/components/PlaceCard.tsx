import { useId, type ReactNode } from 'react'
import { PLACE_CATEGORY_LABEL, placePhone, type Place } from '../types/course'
import Icon from './Icon'

type Props = {
  place: Place
  /** 화면에 보일 순서 번호. 없으면 방송 순서(place.order) */
  number?: number
  /** 주소와 버튼 사이에 넣을 내용 (예: 휠체어·반려견 정보) */
  extra?: ReactNode
}

const SUB_BUTTON =
  'flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-body font-bold text-primary transition-colors hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]'

/** 코스 상세의 장소 카드: 순서 번호, 장소명, 유형·주소, 전화하기·카카오맵 버튼 */
export default function PlaceCard({ place, number, extra }: Props) {
  const nameId = useId()
  // 카카오가 http 주소를 주므로 https로 연다
  const placeUrl = place.placeUrl?.replace(/^http:/, 'https:')
  const phone = placePhone(place)

  return (
    <article
      aria-labelledby={nameId}
      className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
          {number ?? place.order}
          <span className="sr-only">번째</span>
        </span>
        <h3 id={nameId} className="text-card-title font-bold text-text">
          {place.name}
        </h3>
      </div>

      <div className="flex flex-col gap-1 text-caption text-text-sub">
        <p className="flex items-center gap-1.5">
          <Icon name={place.category} className="size-5 text-primary" />
          {PLACE_CATEGORY_LABEL[place.category]}
        </p>
        <p>{place.address ?? place.district}</p>
      </div>

      {extra}

      {/* 좁은 화면에서도 글자가 줄바꿈되지 않게 버튼은 한 줄에 하나씩 둔다 */}
      {(phone || placeUrl) && (
        <div className="flex flex-col gap-2.5">
          {phone && (
            <a href={`tel:${phone}`} aria-describedby={nameId} className={SUB_BUTTON}>
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
