import { PET_ALLOWANCE_LABEL, placePhone, type BarrierFree, type Place } from '../types/course'
import Icon from './Icon'

type Props = {
  place: Place
  /** 휠체어 조건을 골랐는지 */
  wheelchair: boolean
  /** 반려견 조건을 골랐는지 */
  pet: boolean
}

const BARRIER_LABEL: Record<keyof BarrierFree, string> = {
  wheelchair: '대여',
  route: '다니는 길',
  restroom: '화장실',
  parking: '주차',
  elevator: '엘리베이터',
}

/**
 * 고른 조건(휠체어·반려견)에 대한 장소 정보.
 * 정보가 없으면 빼지 않고 "확인 필요"로 보여준다 (CLAUDE.md 데이터 규칙).
 */
export default function AccessInfo({ place, wheelchair, pet }: Props) {
  if (!wheelchair && !pet) return null

  const needCheck = (wheelchair && !place.barrierFree) || (pet && !place.pet)

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-bg p-4">
      {wheelchair && (
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-body font-bold text-text">
            <Icon name="wheelchair" className="size-5 text-primary" />
            휠체어 이용
          </p>
          {place.barrierFree ? (
            <ul className="flex flex-col gap-0.5 text-caption text-text-sub">
              {(Object.keys(BARRIER_LABEL) as (keyof BarrierFree)[])
                .filter((k) => place.barrierFree?.[k])
                .map((k) => (
                  <li key={k}>
                    {BARRIER_LABEL[k]}: {place.barrierFree?.[k]}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-caption font-bold text-accent">확인 필요 · 이용 정보가 없어요</p>
          )}
        </div>
      )}

      {pet && (
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-body font-bold text-text">
            <Icon name="paw" className="size-5 text-primary" />
            반려견 동반
          </p>
          {place.pet ? (
            <ul className="flex flex-col gap-0.5 text-caption text-text-sub">
              <li className="font-bold text-text">{PET_ALLOWANCE_LABEL[place.pet.allowance]}</li>
              {place.pet.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          ) : (
            <p className="text-caption font-bold text-accent">확인 필요 · 동반 정보가 없어요</p>
          )}
        </div>
      )}

      {needCheck && (
        <p className="text-caption text-text-sub">
          {placePhone(place) ? '가기 전에 아래 전화하기로 물어보세요.' : '가기 전에 카카오맵에서 연락처를 찾아 물어보세요.'}
        </p>
      )}
    </div>
  )
}
