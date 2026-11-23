/**
 * 장소명으로 카카오 로컬 키워드 검색을 한다.
 * GET /api/place-search?query=석촌동 고분군
 *
 * KAKAO_REST_API_KEY는 이 서버 함수에서만 읽는다 (브라우저에 노출 금지).
 */

const KAKAO_KEYWORD_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json'

/** 카카오 응답 중 사용하는 필드만 */
type KakaoDocument = {
  id: string
  place_name: string
  category_name: string
  address_name: string
  road_address_name: string
  phone: string
  place_url: string
  /** 경도 */
  x: string
  /** 위도 */
  y: string
}

type KakaoKeywordResponse = {
  documents: KakaoDocument[]
}

export type PlaceSearchResult = {
  kakaoId: string
  name: string
  category: string
  address: string
  phone: string
  placeUrl: string
  lat: number
  lng: number
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

export async function GET(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('query')?.trim()
  if (!query) {
    return json({ error: 'query가 필요합니다.' }, 400)
  }

  const key = process.env.KAKAO_REST_API_KEY
  if (!key) {
    return json({ error: '서버에 KAKAO_REST_API_KEY가 설정되지 않았습니다.' }, 500)
  }

  const url = `${KAKAO_KEYWORD_URL}?${new URLSearchParams({ query, size: '5' })}`
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } })
  if (!res.ok) {
    return json({ error: `카카오 검색 실패 (${res.status})` }, 502)
  }

  const data = (await res.json()) as KakaoKeywordResponse
  const results: PlaceSearchResult[] = data.documents.map((d) => ({
    kakaoId: d.id,
    name: d.place_name,
    category: d.category_name,
    address: d.road_address_name || d.address_name,
    phone: d.phone,
    placeUrl: d.place_url,
    lat: Number(d.y),
    lng: Number(d.x),
  }))

  return json({ query, results })
}
