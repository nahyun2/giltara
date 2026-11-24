import { useEffect, useRef, useState } from 'react'
import { loadKakaoMap } from '../services/kakaoMap'
import type { Place } from '../types/course'

type Props = {
  /** 방문 순서대로 정렬된 장소 */
  places: Place[]
}

type Status = 'loading' | 'ready' | 'error'

type PlaceWithPosition = Place & { lat: number; lng: number }

function hasPosition(place: Place): place is PlaceWithPosition {
  return place.lat !== undefined && place.lng !== undefined
}

/** 마커: 방문 순서 번호가 적힌 초록 동그라미 */
function createMarker(order: number): HTMLElement {
  const el = document.createElement('span')
  el.className =
    'flex size-9 items-center justify-center rounded-full border-2 border-card bg-primary text-body font-bold text-on-color shadow-md'
  el.textContent = String(order)
  return el
}

export default function CourseMap({ places }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<Status>('loading')

  const positioned = places.filter(hasPosition)

  useEffect(() => {
    const container = containerRef.current
    const positioned = places.filter(hasPosition)
    if (!container || positioned.length === 0) return

    let cancelled = false

    loadKakaoMap()
      .then((sdk) => {
        if (cancelled) return
        const { maps } = sdk
        const path = positioned.map((p) => new maps.LatLng(p.lat, p.lng))

        const map = new maps.Map(container, { center: path[0], level: 7 })

        // 방문 순서대로 점선으로 잇는다 (색은 디자인 토큰에서 읽는다)
        const primary = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim()
        new maps.Polyline({
          map,
          path,
          strokeWeight: 4,
          strokeColor: primary,
          strokeOpacity: 0.8,
          strokeStyle: 'shortdash',
        })

        positioned.forEach((p, i) => {
          new maps.CustomOverlay({ map, position: path[i], content: createMarker(p.order), zIndex: 1 })
        })

        if (path.length > 1) {
          const bounds = new maps.LatLngBounds()
          path.forEach((latlng) => bounds.extend(latlng))
          map.setBounds(bounds, 40, 40, 40, 40)
        } else {
          map.setLevel(4)
        }

        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      container.innerHTML = ''
    }
  }, [places])

  if (positioned.length === 0) return null

  const label = `코스 지도: ${positioned.map((p) => `${p.order}번 ${p.name}`).join(', ')}`

  return (
    <div className="relative h-map w-full overflow-hidden rounded-2xl bg-chip shadow-md">
      <div ref={containerRef} role="img" aria-label={label} className="size-full" />
      {status !== 'ready' && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-body text-text-sub">
          {status === 'loading' ? '지도를 불러오고 있어요' : '지도를 불러오지 못했어요. 아래 목록에서 장소를 확인해 주세요.'}
        </p>
      )}
    </div>
  )
}
