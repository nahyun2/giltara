import { hasHolidayYear, holidayName, isLunarHolidayMain } from '../data/holidays'

/**
 * 관광공사 "쉬는 날" 원문으로 고른 날짜에 장소가 쉬는지 판단한다 (#31).
 * 확실히 쉬는 날만 closed, 규칙으로 판단할 수 없으면 check(확인 필요), 그 밖에는 open.
 * 공휴일은 src/data/holidays.json(한국천문연구원 특일 정보)으로 판단한다.
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

function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(y, m - 1, d + days)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

export function restDayStatus(restDays: string | undefined, date: string): RestStatus {
  if (!restDays) return { status: 'open' }

  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  // 첫 줄은 쉬는 날, 다음 줄(※)에 "월요일이 공휴일인 경우 정상운영" 같은 예외가 오기도 한다
  const text = restDays.split('\n')[0]
  const holiday = holidayName(date)
  const knowHolidays = hasHolidayYear(date)

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

  // 정해진 날짜: "1월 1일"
  for (const [, mm, dd] of text.matchAll(/(\d{1,2})월\s*(\d{1,2})일/g)) {
    if (Number(mm) === m && Number(dd) === d) return { status: 'closed', note: `${m}월 ${d}일에 쉬어요` }
  }

  // 설·추석: 공휴일 목록으로 판단. "당일"이면 연휴 가운데 날만
  if (/설|추석/.test(text)) {
    if (knowHolidays) {
      if (holiday && /설날|추석/.test(holiday) && (!/당일/.test(text) || isLunarHolidayMain(date))) {
        return { status: 'closed', note: `${holiday}${/당일/.test(text) ? ' 당일' : ' 연휴'}에 쉬어요` }
      }
    } else if ([1, 2, 9, 10].includes(m)) {
      return { status: 'check', note: '설·추석 연휴에 쉬어요. 이 날이 연휴인지 확인해 주세요' }
    }
  }

  // 매주 쉬는 요일: "매주 월요일(7~8월 제외)" → 7~8월이 아닐 때만
  const weekly = text.match(/매주[^(/※]*/)?.[0] ?? ''
  const closedDays = weekdaysIn(weekly)
  const except = text.match(/(\d{1,2})~(\d{1,2})월\s*제외/)
  const inExceptMonths = (month: number) =>
    except !== null && month >= Number(except[1]) && month <= Number(except[2])
  // 공휴일 예외: "공휴일인 경우 개관/정상운영" 또는 "공휴일인 경우 그 다음날 휴관"
  const openOnHoliday = /공휴일[^/]*(개관|정상)/.test(restDays)
  const nextDayIfHoliday = /공휴일[^/]*다음\s*날/.test(restDays)

  if (closedDays.includes(day) && !inExceptMonths(m)) {
    if (holiday && (openOnHoliday || nextDayIfHoliday)) return { status: 'open' }
    if (!knowHolidays && (openOnHoliday || nextDayIfHoliday)) {
      return { status: 'check', note: `매주 ${WEEKDAY[day]}요일에 쉬어요. 공휴일이면 달라요` }
    }
    return { status: 'closed', note: `매주 ${WEEKDAY[day]}요일에 쉬어요` }
  }

  // "월요일이 공휴일이면 그 다음날 휴관": 어제가 쉬는 요일이면서 공휴일이었으면 오늘 쉼
  if (nextDayIfHoliday) {
    const yesterday = shiftDate(date, -1)
    const [yy, ym, yd] = yesterday.split('-').map(Number)
    const yDay = new Date(yy, ym - 1, yd).getDay()
    if (closedDays.includes(yDay) && !inExceptMonths(ym) && holidayName(yesterday)) {
      return { status: 'closed', note: `${WEEKDAY[yDay]}요일이 공휴일이라 다음 날인 오늘 쉬어요` }
    }
  }

  return { status: 'open' }
}
