/** 장소 유형. 화면에 보이는 한국어 이름은 PLACE_CATEGORY_LABEL을 쓴다. */
export type PlaceCategory = 'market' | 'food' | 'nature' | 'culture' | 'cafe'

export const PLACE_CATEGORY_LABEL: Record<PlaceCategory, string> = {
  market: '시장',
  food: '음식점',
  nature: '자연',
  culture: '문화·체험',
  cafe: '카페',
}

/** 휠체어 이용 정보 (한국관광공사 무장애 여행 정보). 항목마다 원문 설명 */
export type BarrierFree = {
  /** 휠체어 대여 */
  wheelchair?: string
  /** 출입 경로 (경사로, 턱 등) */
  route?: string
  restroom?: string
  parking?: string
  elevator?: string
}

/** 반려동물 동반: 전 구역 / 일부 구역 / 불가 */
export type PetAllowance = 'all' | 'partial' | 'none'

export const PET_ALLOWANCE_LABEL: Record<PetAllowance, string> = {
  all: '전 구역 동반 가능',
  partial: '일부 구역 동반 가능',
  none: '동반 불가',
}

/** 반려동물 동반 정보 (한국관광공사 반려동물 동반 여행 정보) */
export type PetInfo = {
  allowance: PetAllowance
  /** 유의 사항 (예: "민박 시설은 동반 불가") */
  notes: string[]
}

/** 문의처 (관광공사 원문에서 전화번호만 따로 뽑음) */
export type Contact = {
  /** 예: "매표요금", "송파구청 문화유산과". 없으면 비어 있다 */
  label?: string
  phone: string
}

/** 예약이 꼭 필요한 장소의 안내 */
export type Reservation = {
  /** 신청 페이지 */
  url?: string
  /** 신청 문의 전화 */
  phone?: string
  /** 유의 사항 (원문) */
  notes: string[]
}

/** 가기 전에 확인할 이용 정보 (한국관광공사 소개 정보, #30). 원문 문장을 그대로 둔다 */
export type VisitInfo = {
  contacts?: Contact[]
  /** 쉬는 날 원문 (예: "매주 월요일 / 1월 1일 / 설·추석") */
  restDays?: string
  /** 이용 시간 원문. 줄바꿈(\n)으로 구분 */
  hours?: string
  /** 요금 원문. 줄바꿈(\n)으로 구분 */
  fee?: string
  homepage?: string
  /** 예약이 꼭 필요할 때만 있다 */
  reservation?: Reservation
}

export type Place = {
  /** 방문 순서 (1부터) */
  order: number
  name: string
  category: PlaceCategory
  /** 구·동 등 세부 지역 (예: "강릉시 중앙동") */
  district: string
  /** 비어 있으면 자리표시를 보여준다. 추후 TourAPI 사진으로 채운다. */
  imageUrl?: string

  /* 아래는 카카오 장소 매칭(#8)으로 채운다. 매칭되지 않은 장소는 비어 있다. */
  /** 카카오 장소 ID */
  kakaoId?: string
  /** 도로명 주소 (없으면 지번 주소) */
  address?: string
  /** 위도 */
  lat?: number
  /** 경도 */
  lng?: number
  /** 원터치 전화용. 카카오에 등록된 번호가 없으면 비어 있다. */
  phone?: string
  /** 카카오맵 장소 페이지 */
  placeUrl?: string

  /* 아래는 한국관광공사 TourAPI(#19)로 채운다. 정보가 없으면 비어 있다 → 화면에서는 "확인 필요"로 보여준다. */
  /** 관광공사 장소 ID (contentId) */
  tourContentId?: string
  barrierFree?: BarrierFree
  pet?: PetInfo
  visitInfo?: VisitInfo
}

/** 원터치 전화에 쓸 번호: 카카오 번호, 없으면 관광공사 첫 번째 문의처 */
export function placePhone(place: Place): string | undefined {
  return place.phone ?? place.visitInfo?.contacts?.[0]?.phone
}

export type Course = {
  id: string
  /** 방송 프로그램명 */
  program: string
  /** 방송 회차 */
  episode: number
  city: string
  title: string
  /** 한 줄 소개 */
  summary: string
  places: Place[]
}
