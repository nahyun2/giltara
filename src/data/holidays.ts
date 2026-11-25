import holidayData from './holidays.json'

/**
 * 공휴일 목록 (한국천문연구원 특일 정보 API에서 받아 저장, #31).
 * 형식: { "2026": [{ "date": "2026-02-17", "name": "설날" }, ...] }
 */
type Holiday = { date: string; name: string }

const byYear = holidayData as Record<string, Holiday[]>
const byDate = new Map(Object.values(byYear).flat().map((h) => [h.date, h.name]))

/** 이 날짜의 공휴일 이름. 공휴일이 아니면 undefined */
export function holidayName(date: string): string | undefined {
  return byDate.get(date)
}

/** 저장된 공휴일 목록에 이 해가 있는지 (없으면 공휴일 판단을 못 한다) */
export function hasHolidayYear(date: string): boolean {
  return date.slice(0, 4) in byYear
}

/**
 * 설·추석 "당일"인지. 연휴 3일 중 가운데 날이 당일이다.
 * (대체공휴일은 이름이 따로 붙으므로 연휴 묶음에 들어가지 않는다)
 */
export function isLunarHolidayMain(date: string): boolean {
  const name = byDate.get(date)
  if (!name || !/설날|추석/.test(name)) return false
  const shift = (days: number) => {
    const [y, m, d] = date.split('-').map(Number)
    const t = new Date(y, m - 1, d + days)
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  }
  return byDate.get(shift(-1)) === name && byDate.get(shift(1)) === name
}
