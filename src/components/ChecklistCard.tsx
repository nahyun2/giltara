import { useId } from 'react'
import { PLACE_CATEGORY_LABEL, placePhone, type Place } from '../types/course'
import Icon from './Icon'

type Props = {
  place: Place
  /** 화면에 보일 순서 번호 */
  number: number
  /** 가기 전에 확인할 것 (예: "휠체어 이용 정보가 없어요") */
  checkNotes: string[]
  done: boolean
  onToggle: () => void
}

const SUB_BUTTON =
  'flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-3 text-body font-bold text-primary transition-colors hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]'

/** 줄바꿈(\n)이 있는 원문을 줄마다 보여준다 */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  )
}

/** 가기 전 확인 카드: 확인할 것, 예약·문의·이용 정보, 바로가기, 완료 체크 */
export default function ChecklistCard({ place, number, checkNotes, done, onToggle }: Props) {
  const nameId = useId()
  const info = place.visitInfo
  const reservation = info?.reservation
  const placeUrl = place.placeUrl?.replace(/^http:/, 'https:')
  // 문의처: 관광공사 목록, 없으면 카카오 번호 하나
  const contacts = info?.contacts ?? (placePhone(place) ? [{ phone: placePhone(place) as string }] : [])

  return (
    <article
      aria-labelledby={nameId}
      className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
          {number}
          <span className="sr-only">번째</span>
        </span>
        <div className="flex flex-col">
          <h3 id={nameId} className="text-card-title font-bold text-text">
            {place.name}
          </h3>
          <p className="text-caption text-text-sub">{PLACE_CATEGORY_LABEL[place.category]}</p>
        </div>
      </div>

      {/* 예약 안내 */}
      {reservation && (
        <div className="flex flex-col gap-2 rounded-xl bg-bg p-4">
          <p className="text-body font-bold text-accent">미리 신청해야 들어갈 수 있어요</p>
          <ul className="flex flex-col gap-0.5 text-caption text-text">
            {reservation.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          {reservation.url && (
            <a href={reservation.url} target="_blank" rel="noopener noreferrer" className={SUB_BUTTON}>
              <Icon name="arrow" className="size-5" />
              신청 페이지 열기
            </a>
          )}
          {reservation.phone && (
            <a href={`tel:${reservation.phone}`} className={SUB_BUTTON}>
              <Icon name="phone" className="size-5" />
              신청 문의 {reservation.phone}
            </a>
          )}
        </div>
      )}

      {/* 확인할 것 */}
      {checkNotes.length > 0 && (
        <div className="flex flex-col gap-1 rounded-xl bg-bg p-4">
          <p className="text-body font-bold text-accent">전화로 물어보세요</p>
          <ul className="flex flex-col gap-0.5 text-caption text-text">
            {checkNotes.map((note) => (
              <li key={note}>· {note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 이용 정보 (원문) */}
      {info ? (
        <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-caption">
          {/* 예약 장소는 이용 시간이 예약 유의 사항과 같아 한 번만 보여준다 */}
          {info.hours && !reservation && (
            <>
              <dt className="font-bold text-text">이용 시간</dt>
              <dd className="col-span-2 text-text-sub">
                <Lines text={info.hours} />
              </dd>
            </>
          )}
          {info.restDays && (
            <>
              <dt className="font-bold text-text">쉬는 날</dt>
              <dd className="col-span-2 text-text-sub">
                <Lines text={info.restDays} />
              </dd>
            </>
          )}
          {info.fee && (
            <>
              <dt className="font-bold text-text">요금</dt>
              <dd className="col-span-2 text-text-sub">
                <Lines text={info.fee} />
              </dd>
            </>
          )}
        </dl>
      ) : (
        <p className="text-caption text-text-sub">이용 정보가 없어요. 카카오맵에서 확인해 주세요.</p>
      )}

      {/* 바로가기 */}
      <div className="flex flex-col gap-2.5">
        {!reservation &&
          contacts.map((c) => (
            <a key={c.phone} href={`tel:${c.phone}`} aria-describedby={nameId} className={SUB_BUTTON}>
              <Icon name="phone" className="size-5 shrink-0" />
              {c.label ? `${c.label} 전화` : '전화하기'}
            </a>
          ))}
        {info?.homepage && !reservation && (
          <a href={info.homepage} target="_blank" rel="noopener noreferrer" aria-describedby={nameId} className={SUB_BUTTON}>
            <Icon name="arrow" className="size-5" />
            홈페이지 열기
          </a>
        )}
        {placeUrl && (
          <a href={placeUrl} target="_blank" rel="noopener noreferrer" aria-describedby={nameId} className={SUB_BUTTON}>
            <Icon name="map" className="size-5" />
            카카오맵에서 보기
          </a>
        )}
      </div>

      {/* 완료 체크 */}
      <button
        type="button"
        aria-pressed={done}
        aria-describedby={nameId}
        onClick={onToggle}
        className={`flex h-button items-center justify-center gap-2 rounded-xl text-button font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark ${
          done ? 'bg-primary text-on-color' : 'border-2 border-chip bg-card text-text hover:border-primary'
        }`}
      >
        {done && <Icon name="check" className="size-6" />}
        {done ? '확인했어요' : '확인했으면 눌러 주세요'}
      </button>
    </article>
  )
}
