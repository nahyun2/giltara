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

/** 인원 선택지. 마지막 값은 "이상"으로 표시한다 */
export const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6] as const
export const PEOPLE_MAX = 6
