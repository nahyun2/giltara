import { routeKey, type TransitRoute } from '../types/route'
import routeData from './transitRoutes.json'

/**
 * 저장된 대중교통 경로 (ODsay 원본: docs/data/odsay-routes.raw.json, #37).
 * JSON은 kind를 string으로 추론하므로 여기서 한 번만 타입을 지정한다.
 */
const routes = routeData as Record<string, TransitRoute>

/** 저장된 경로. 없으면 undefined (카카오맵 길찾기로 안내) */
export function getTransitRoute(fromName: string, toName: string): TransitRoute | undefined {
  return routes[routeKey(fromName, toName)]
}
