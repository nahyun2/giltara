/**
 * 맞춤 코스 추천 이유를 서버 함수(/api/course-reason)에 요청한다.
 * Gemini 키는 서버에서만 쓴다. 같은 입력은 이 탭에서 한 번만 요청한다.
 */

import type { PetAllowance, PlaceCategory } from '../types/course'
import type { DropReason, Transport } from '../types/trip'

export type CourseReasonInput = {
  courseId: string
  title: string
  summary: string
  city: string
  transport: Transport
  people: number
  wheelchair: boolean
  pet: boolean
  totalMinutes: number
  places: {
    name: string
    category: PlaceCategory
    wheelchairInfo?: string
    petAllowance?: PetAllowance
  }[]
  dropped: { name: string; reason: DropReason }[]
}

const CACHE_PREFIX = 'course-reason:'

function readCache(key: string): string | null {
  try {
    return sessionStorage.getItem(CACHE_PREFIX + key)
  } catch {
    return null
  }
}

function writeCache(key: string, text: string) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, text)
  } catch {
    // 저장이 막혀 있어도 화면은 동작한다
  }
}

/** 실패하면 null (화면은 기본 문장을 보여준다) */
export async function fetchCourseReason(input: CourseReasonInput): Promise<string | null> {
  const key = JSON.stringify(input)
  const cached = readCache(key)
  if (cached) return cached

  try {
    const res = await fetch('/api/course-reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: key,
    })
    if (!res.ok) return null
    const data = (await res.json()) as { reason?: string }
    if (!data.reason) return null
    writeCache(key, data.reason)
    return data.reason
  } catch {
    return null
  }
}
