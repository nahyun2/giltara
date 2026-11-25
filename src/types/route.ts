/**
 * 대중교통 경로 (ODsay 대중교통 길찾기, #37).
 * 맞춤 코스에서 나올 수 있는 장소 → 장소 24구간을 한 번만 받아 src/data/transitRoutes.json에 저장했다.
 * 앱은 저장된 값만 읽고 ODsay를 다시 부르지 않는다 (CLAUDE.md ODsay 사용 규칙).
 */

export type TransitStep =
  | { kind: 'walk'; minutes: number; meters: number }
  | {
      kind: 'bus' | 'subway'
      minutes: number
      /** 타는 곳 */
      from: string
      /** 내리는 곳 */
      to: string
      /** 버스 번호 또는 지하철 노선 이름 (경유지 설명은 뺌) */
      lines: string[]
      /** 지나는 정거장 수 */
      stations: number
    }

export type TransitRoute =
  | {
      kind: 'transit'
      totalMinutes: number
      /** 요금 (원, 1인) */
      fare: number
      /** 갈아타는 횟수 */
      transfers: number
      walkMeters: number
      steps: TransitStep[]
    }
  /** 700m 안쪽이라 걸어가는 구간 */
  | { kind: 'walk'; totalMinutes: number; meters: number }

/** 저장 키: "출발 장소명 → 도착 장소명" */
export function routeKey(fromName: string, toName: string): string {
  return `${fromName} → ${toName}`
}
