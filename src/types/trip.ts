/** 이동수단 */
export type Transport = 'car' | 'transit'

export const TRANSPORT_LABEL: Record<Transport, string> = {
  car: '자가용',
  transit: '대중교통',
}

/** 사용자가 고른 여행 조건 (조건 입력 화면 → 맞춤 코스 생성) */
export type TripConditions = {
  /** 여행 날짜 (YYYY-MM-DD) */
  date: string
  /** 인원. 6은 "6명 이상" */
  people: number
  transport: Transport
  /** 휠체어 이용 */
  wheelchair: boolean
  /** 반려견 동반 */
  pet: boolean
}

/** 아직 다 고르지 않은 조건 */
export type PartialTripConditions = Partial<TripConditions>

/* ---------- 맞춤 코스 (#20) ---------- */

/** 장소를 코스에서 뺀 이유 */
export type DropReason = 'pet-not-allowed' | 'needs-check' | 'far'

export const DROP_REASON_LABEL: Record<DropReason, string> = {
  'pet-not-allowed': '반려견 동반이 안 되는 곳이에요',
  'needs-check': '고른 조건에 맞는지 정보가 없어요',
  far: '다른 장소와 거리가 멀어요',
}

/** 고른 조건에 대해 정보가 없어 미리 확인해야 하는 것 */
export type CheckItem = 'wheelchair' | 'pet'

export const CHECK_ITEM_LABEL: Record<CheckItem, string> = {
  wheelchair: '휠체어 이용',
  pet: '반려견 동반',
}

/** 장소 사이 이동 (직선거리 기반 추정) */
export type Leg = {
  km: number
  minutes: number
}

/** 조건에 맞춰 고른 하루 코스 */
export type CustomCourse<P> = {
  /** 방문 순서대로 고른 장소 */
  places: P[]
  /** places[i] → places[i + 1] 이동 */
  legs: Leg[]
  totalMinutes: number
  /** 뺀 장소와 이유 */
  dropped: { place: P; reason: DropReason }[]
  /** 코스에 남았지만 미리 확인해야 하는 것 */
  checks: { place: P; items: CheckItem[] }[]
}

/** 인원 선택지. 마지막 값은 "이상"으로 표시한다 */
export const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6] as const
export const PEOPLE_MAX = 6
