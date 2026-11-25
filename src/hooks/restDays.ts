/**
 * 관광공사 "쉬는 날" 원문으로 고른 날짜에 장소가 쉬는지 판단한다 (#31).
 * 확실히 쉬는 날만 closed, 규칙으로 판단할 수 없으면 check(확인 필요), 그 밖에는 open.
 */

export type RestStatus =
  | { status: 'open' }
  | { status: 'closed'; note: string }
  | { status: 'check'; note: string }

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

/** "매주 화요일, 수요일" → [2, 3] */
function weekdaysIn(text: string): number[] {
  return [...text.matchAll(/([월화수목금토일])요일/g)].map((m) => WEEKDAY.indexOf(m[1]))
}

/** 원문 첫 줄 (※ 유의 사항 줄은 뺀다) */
function firstLine(text: string): string {
  return text.split('\n')[0]
}

export function restDayStatus(restDays: string | undefined, date: string): RestStatus {
  if (!restDays) return { status: 'open' }

  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  const text = firstLine(restDays)

  // 점포마다 다른 시장·거리는 장소 전체가 쉬지 않는다
  if (/점포/.test(text)) return { status: 'open' }

  // "연중무휴 (단, 매주 월요일 민속관 등 일부시설 휴관)": 장소는 열지만 일부 시설이 쉼
  if (/^연중무휴/.test(text)) {
    const partial = text.match(/\((.*)\)/)?.[1] ?? ''
    if (/매주/.test(partial) && weekdaysIn(partial).includes(day)) {
      return { status: 'check', note: `${WEEKDAY[day]}요일에는 일부 시설이 쉬어요` }
    }
    return { status: 'open' }
  }

  // 매주 쉬는 요일: "매주 월요일(7~8월 제외)" → 7~8월이 아닐 때만
  const weekly = text.match(/매주[^(/※]*/)?.[0] ?? ''
  const except = text.match(/(\d{1,2})~(\d{1,2})월\s*제외/)
  const exceptMonth = except !== null && m >= Number(except[1]) && m <= Number(except[2])
  if (weekly && !exceptMonth && weekdaysIn(weekly).includes(day)) {
    return { status: 'closed', note: `매주 ${WEEKDAY[day]}요일에 쉬어요` }
  }

  // 정해진 날짜: "1월 1일"
  for (const [, mm, dd] of text.matchAll(/(\d{1,2})월\s*(\d{1,2})일/g)) {
    if (Number(mm) === m && Number(dd) === d) return { status: 'closed', note: `${m}월 ${d}일에 쉬어요` }
  }

  // 설·추석은 음력이라 날짜를 정할 수 없다 → 그 무렵이면 확인 필요
  if (/설|추석/.test(text) && [1, 2, 9, 10].includes(m)) {
    return { status: 'check', note: '설·추석 연휴에 쉬어요. 이 날이 연휴인지 확인해 주세요' }
  }

  return { status: 'open' }
}
