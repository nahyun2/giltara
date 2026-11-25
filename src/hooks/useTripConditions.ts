import { useSearchParams } from 'react-router'
import {
  PEOPLE_MAX,
  type PartialTripConditions,
  type Transport,
  type TripConditions,
} from '../types/trip'

/**
 * 여행 조건과 현재 단계를 주소(쿼리)에 담아 둔다.
 * 단계를 넘길 때마다 기록이 쌓이므로 휴대폰 뒤로 가기로 앞 단계에 돌아갈 수 있다.
 */

const TRANSPORTS: Transport[] = ['car', 'transit']

function isTransport(value: string | null): value is Transport {
  return value !== null && (TRANSPORTS as string[]).includes(value)
}

export function parseConditions(params: URLSearchParams): PartialTripConditions {
  const date = params.get('date')
  const people = Number(params.get('people'))
  const transport = params.get('transport')

  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    people: Number.isInteger(people) && people >= 1 && people <= PEOPLE_MAX ? people : undefined,
    transport: isTransport(transport) ? transport : undefined,
    wheelchair: params.get('wheelchair') === '1',
    pet: params.get('pet') === '1',
  }
}

export function toSearchParams(conditions: PartialTripConditions, step?: number): URLSearchParams {
  const params = new URLSearchParams()
  if (step !== undefined) params.set('step', String(step))
  if (conditions.date) params.set('date', conditions.date)
  if (conditions.people) params.set('people', String(conditions.people))
  if (conditions.transport) params.set('transport', conditions.transport)
  if (conditions.wheelchair) params.set('wheelchair', '1')
  if (conditions.pet) params.set('pet', '1')
  return params
}

export function isComplete(c: PartialTripConditions): c is TripConditions {
  return c.date !== undefined && c.people !== undefined && c.transport !== undefined
}

export function useTripConditions(totalSteps: number) {
  const [params, setParams] = useSearchParams()
  const conditions = parseConditions(params)
  const rawStep = Number(params.get('step'))
  const step = Number.isInteger(rawStep) && rawStep >= 1 && rawStep <= totalSteps ? rawStep : 1

  /** 같은 단계에서 고른 값을 바꾼다 (기록을 쌓지 않음) */
  const update = (patch: PartialTripConditions) => {
    setParams(toSearchParams({ ...conditions, ...patch }, step), { replace: true })
  }

  /**
   * 다른 단계로 이동한다 (뒤로 가기로 돌아올 수 있게 기록을 쌓음).
   * patch: 방금 고른 값. 자동으로 넘어갈 때 아직 주소에 반영되기 전 값을 함께 넘긴다.
   */
  const goTo = (next: number, patch: PartialTripConditions = {}) => {
    setParams(toSearchParams({ ...conditions, ...patch }, next))
  }

  return { conditions, step, update, goTo }
}

/* ---------- 날짜 ---------- */

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

/** 로컬 날짜를 YYYY-MM-DD로 */
export function toDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** "11월 29일 (토)" */
export function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return `${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`
}

/** 오늘부터 가까운 토·일 4개 (이번 주말, 다음 주말) */
export function upcomingWeekendDates(today = new Date()): string[] {
  const dates: string[] = []
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  while (dates.length < 4) {
    const day = cursor.getDay()
    if (day === 0 || day === 6) dates.push(toDateString(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}
