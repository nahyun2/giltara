/** 장소 유형. 화면에 보이는 한국어 이름은 PLACE_CATEGORY_LABEL을 쓴다. */
export type PlaceCategory = 'market' | 'food' | 'nature' | 'culture' | 'cafe'

export const PLACE_CATEGORY_LABEL: Record<PlaceCategory, string> = {
  market: '시장',
  food: '음식점',
  nature: '자연',
  culture: '문화·체험',
  cafe: '카페',
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
