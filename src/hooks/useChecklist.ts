import { useState } from 'react'

/**
 * 가기 전 확인 화면의 완료 체크 (#32).
 * 이 휴대폰 브라우저(localStorage)에만 저장한다. 여러 기기에서 같이 보는 저장은 Sprint 6.
 * 저장이 막혀 있어도(사생활 보호 모드 등) 화면은 동작한다.
 */

const PREFIX = 'checklist:'

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(key: string, done: string[]) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(done))
  } catch {
    // 저장이 막혀 있어도 화면은 동작한다
  }
}

/** key: 코스와 조건마다 따로 저장하기 위한 이름 (예: "dongne-388?date=…") */
export function useChecklist(key: string) {
  const [state, setState] = useState(() => ({ key, done: read(key) }))
  // 다른 코스·조건으로 바뀌면 그 키로 다시 읽는다
  const done = state.key === key ? state.done : read(key)

  // 연달아 눌러도 앞의 체크가 덮어써지지 않게, 항상 가장 최신 목록을 기준으로 바꾼다
  const toggle = (id: string) => {
    setState((prev) => {
      const current = prev.key === key ? prev.done : read(key)
      const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
      write(key, next)
      return { key, done: next }
    })
  }

  return { isDone: (id: string) => done.includes(id), toggle, doneCount: done.length }
}
