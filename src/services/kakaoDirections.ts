import type { Place } from '../types/course'

/** 카카오맵 길찾기 이동수단 (카카오맵 URL 규칙의 값 그대로) */
export type DirectionsMode = 'car' | 'traffic' | 'walk'

const BASE = 'https://map.kakao.com/link'

/** "이름,위도,경도". 이름에 쉼표·빗금이 있어도 주소가 깨지지 않게 인코딩한다 */
function point(place: Place): string | undefined {
  if (place.lat === undefined || place.lng === undefined) return undefined
  return `${encodeURIComponent(place.name)},${place.lat},${place.lng}`
}

/** 지금 있는 곳 → 장소. 출발지는 카카오맵이 정한다 (휴대폰에서는 현재 위치) */
export function directionsTo(place: Place): string | undefined {
  const to = point(place)
  return to && `${BASE}/to/${to}`
}

/** 장소 → 장소 길찾기 결과. API를 부르지 않고 카카오맵을 연다 (#39) */
export function directionsBetween(from: Place, to: Place, mode: DirectionsMode): string | undefined {
  const a = point(from)
  const b = point(to)
  return a && b && `${BASE}/by/${mode}/${a}/${b}`
}
