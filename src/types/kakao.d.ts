/**
 * 카카오 지도 JavaScript SDK 중 이 앱에서 쓰는 부분만 선언한다.
 * 공식 타입 패키지가 없어 필요한 만큼만 직접 적는다.
 * https://apis.map.kakao.com/web/documentation/
 */

declare namespace kakao.maps {
  function load(callback: () => void): void

  class LatLng {
    constructor(lat: number, lng: number)
  }

  class LatLngBounds {
    constructor()
    extend(latlng: LatLng): void
  }

  type MapOptions = {
    center: LatLng
    level?: number
  }

  class Map {
    constructor(container: HTMLElement, options: MapOptions)
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void
    setCenter(latlng: LatLng): void
    setLevel(level: number): void
    relayout(): void
  }

  type CustomOverlayOptions = {
    map?: Map
    position: LatLng
    content: HTMLElement | string
    xAnchor?: number
    yAnchor?: number
    zIndex?: number
  }

  class CustomOverlay {
    constructor(options: CustomOverlayOptions)
    setMap(map: Map | null): void
  }

  type PolylineOptions = {
    map?: Map
    path: LatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    strokeStyle?: 'solid' | 'shortdash' | 'shortdot' | 'shortdashdot' | 'dot' | 'dash' | 'longdash'
  }

  class Polyline {
    constructor(options: PolylineOptions)
    setMap(map: Map | null): void
  }
}

interface Window {
  kakao?: typeof kakao
}
