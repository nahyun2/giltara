import { useEffect, useState } from 'react'
import type { Course, Place } from '../types/course'
import type {
  CheckItem,
  CustomCourse,
  DropReason,
  Leg,
  Transport,
  TripConditions,
} from '../types/trip'
import { fetchCourseReason, type CourseReasonInput } from '../services/courseReason'

/* ---------- 규칙 기반 코스 고르기 ---------- */

/** 하루에 가는 장소 수 */
const MAX_PLACES = 4
const MIN_PLACES = 3

/** 직선거리를 실제 길로 보정하는 비율 */
const ROAD_FACTOR = 1.3
/** 이동수단별 평균 속도 (km/h)와 구간마다 더하는 시간 (분) */
const SPEED: Record<Transport, { kmh: number; extraMinutes: number }> = {
  car: { kmh: 40, extraMinutes: 0 },
  transit: { kmh: 20, extraMinutes: 10 },
}

/** 두 좌표 사이 직선거리 (km) */
function distanceKm(a: Place, b: Place): number {
  if (a.lat === undefined || a.lng === undefined || b.lat === undefined || b.lng === undefined) return 0
  const R = 6371
  const rad = Math.PI / 180
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad)
  const y = (b.lat - a.lat) * rad
  return Math.sqrt(x * x + y * y) * R
}

function pathKm(places: Place[]): number {
  return places.slice(1).reduce((sum, p, i) => sum + distanceKm(places[i], p), 0)
}

function toLeg(a: Place, b: Place, transport: Transport): Leg {
  const km = distanceKm(a, b) * ROAD_FACTOR
  const { kmh, extraMinutes } = SPEED[transport]
  // 5분 단위로 올림
  const minutes = Math.max(5, Math.ceil(((km / kmh) * 60 + extraMinutes) / 5) * 5)
  return { km: Math.round(km * 10) / 10, minutes }
}

/** 고른 조건에 대해 정보가 없는 항목 */
function missingChecks(place: Place, c: TripConditions): CheckItem[] {
  const items: CheckItem[] = []
  if (c.wheelchair && !place.barrierFree) items.push('wheelchair')
  if (c.pet && !place.pet) items.push('pet')
  return items
}

/**
 * 조건에 맞춰 하루 3~4곳을 고른다. 방송 순서는 바꾸지 않는다.
 * 1. 반려견을 골랐으면 "동반 불가" 장소를 뺀다
 * 2. 4곳이 넘으면 "확인 필요" 장소부터, 그다음 빼면 이동 거리가 가장 많이 줄어드는 장소를 뺀다
 */
export function planCourse(course: Course, c: TripConditions): CustomCourse<Place> {
  let places = [...course.places].sort((a, b) => a.order - b.order)
  const dropped: { place: Place; reason: DropReason }[] = []

  if (c.pet) {
    for (const p of places.filter((p) => p.pet?.allowance === 'none')) {
      dropped.push({ place: p, reason: 'pet-not-allowed' })
    }
    places = places.filter((p) => p.pet?.allowance !== 'none')
  }

  while (places.length > MAX_PLACES && places.length > MIN_PLACES) {
    const needCheck = places.filter((p) => missingChecks(p, c).length > 0)
    const candidates = needCheck.length > 0 ? needCheck : places
    const total = pathKm(places)
    // 빼면 이동 거리가 가장 많이 줄어드는 장소 (같으면 뒤 순서)
    let best = candidates[0]
    let bestSaving = -Infinity
    for (const p of candidates) {
      const saving = total - pathKm(places.filter((x) => x !== p))
      if (saving >= bestSaving) {
        best = p
        bestSaving = saving
      }
    }
    dropped.push({ place: best, reason: needCheck.length > 0 ? 'needs-check' : 'far' })
    places = places.filter((p) => p !== best)
  }

  const legs = places.slice(1).map((p, i) => toLeg(places[i], p, c.transport))
  const checks = places
    .map((place) => ({ place, items: missingChecks(place, c) }))
    .filter((x) => x.items.length > 0)

  return {
    places,
    legs,
    totalMinutes: legs.reduce((sum, l) => sum + l.minutes, 0),
    dropped,
    checks,
  }
}

/* ---------- 추천 이유 ---------- */

/** Gemini를 부르지 못할 때 쓰는 기본 문장 (데이터에 있는 사실만) */
export function fallbackReason(course: Course, plan: CustomCourse<Place>, c: TripConditions): string {
  const how = c.transport === 'car' ? '자가용으로' : '대중교통으로'
  return `${course.city}의 ${plan.places.length}곳을 ${how} 다녀요. 장소 사이 이동은 모두 합쳐 약 ${plan.totalMinutes}분이에요.`
}

export function toReasonInput(
  course: Course,
  plan: CustomCourse<Place>,
  c: TripConditions,
): CourseReasonInput {
  return {
    courseId: course.id,
    title: course.title,
    summary: course.summary,
    city: course.city,
    transport: c.transport,
    people: c.people,
    wheelchair: c.wheelchair,
    pet: c.pet,
    totalMinutes: plan.totalMinutes,
    places: plan.places.map((p) => ({
      name: p.name,
      category: p.category,
      wheelchairInfo: p.barrierFree ? Object.values(p.barrierFree).join(' / ') : undefined,
      petAllowance: p.pet?.allowance,
    })),
    dropped: plan.dropped.map((d) => ({ name: d.place.name, reason: d.reason })),
  }
}

/** 고른 코스의 추천 이유. Gemini 결과가 오기 전·실패 시에는 기본 문장 */
export function useCourseReason(course: Course, plan: CustomCourse<Place>, c: TripConditions) {
  const input = toReasonInput(course, plan, c)
  const key = JSON.stringify(input)
  const [result, setResult] = useState<{ key: string; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCourseReason(JSON.parse(key) as CourseReasonInput).then((text) => {
      if (!cancelled && text) setResult({ key, text })
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const ready = result?.key === key
  return {
    text: ready ? result.text : fallbackReason(course, plan, c),
    fromAi: ready,
  }
}
