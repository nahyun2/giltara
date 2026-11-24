/**
 * 맞춤 코스 추천 이유를 Gemini로 1~2문장 작성한다.
 * POST /api/course-reason  (body: 고른 장소와 조건, src/services/courseReason.ts의 CourseReasonInput)
 *
 * 코스 고르기는 규칙 기반(src/hooks/useCustomCourse.ts)이고, Gemini는 문장만 쓴다.
 * 받은 정보에 없는 사실은 쓰지 않게 한다 (CLAUDE.md 데이터 규칙).
 * GEMINI_API_KEY는 이 서버 함수에서만 읽는다.
 */

const MODEL = 'gemini-3.5-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const CATEGORY_LABEL: Record<string, string> = {
  market: '시장',
  food: '음식점',
  nature: '자연',
  culture: '문화·체험',
  cafe: '카페',
}
const PET_LABEL: Record<string, string> = {
  all: '전 구역 반려견 동반 가능',
  partial: '일부 구역 반려견 동반 가능',
  none: '반려견 동반 불가',
}
const DROP_LABEL: Record<string, string> = {
  'pet-not-allowed': '반려견 동반 불가',
  'needs-check': '고른 조건에 맞는지 정보 없음',
  far: '다른 장소와 거리가 멂',
}

type Input = {
  title: string
  summary: string
  city: string
  transport: 'car' | 'transit'
  people: number
  wheelchair: boolean
  pet: boolean
  totalMinutes: number
  places: { name: string; category: string; wheelchairInfo?: string; petAllowance?: string }[]
  dropped: { name: string; reason: string }[]
}

function isInput(v: unknown): v is Input {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    typeof o.title === 'string' &&
    typeof o.city === 'string' &&
    Array.isArray(o.places) &&
    o.places.length > 0 &&
    o.places.length <= 6 &&
    Array.isArray(o.dropped) &&
    o.dropped.length <= 6
  )
}

function buildPrompt(i: Input): string {
  const places = i.places
    .map((p, n) => {
      // 고른 조건에 대해 정보가 없는 곳은 "정보 없음"을 분명히 적는다 (없으면 된다고 넘겨짚음)
      const extra = [
        i.wheelchair ? (p.wheelchairInfo ? `휠체어: ${p.wheelchairInfo}` : '휠체어 정보 없음(확인 필요)') : '',
        i.pet
          ? p.petAllowance
            ? (PET_LABEL[p.petAllowance] ?? '')
            : '반려견 동반 정보 없음(확인 필요)'
          : '',
      ]
        .filter(Boolean)
        .join(', ')
      return `${n + 1}. ${p.name} (${CATEGORY_LABEL[p.category] ?? ''})${extra ? ` — ${extra}` : ''}`
    })
    .join('\n')
  const dropped = i.dropped.map((d) => `- ${d.name}: ${DROP_LABEL[d.reason] ?? ''}`).join('\n') || '없음'
  const who = [
    `${i.people >= 6 ? '6명 이상' : `${i.people}명`}`,
    i.wheelchair ? '휠체어 이용' : '',
    i.pet ? '반려견 동반' : '',
  ]
    .filter(Boolean)
    .join(', ')

  return `너는 장년(50~70대) 부부에게 여행 코스를 소개하는 안내원이다.
아래 [정보]만 사용해서 이 코스를 추천하는 이유를 써라.

[규칙]
- 1~2문장, 모두 합쳐 90자 이내
- [정보]에 없는 사실(음식, 풍경, 계절, 역사, 거리, 시간 등)은 절대 쓰지 않는다
- 이동 시간은 [정보]에 있는 숫자만 쓴다
- "정보 없음(확인 필요)"인 장소에 대해 이용할 수 있다거나 잘 갖춰졌다고 쓰지 않는다. 그런 장소가 있으면 "일부 장소는 미리 확인해 보세요"처럼 덧붙인다
- 휠체어·반려견 정보는 그 조건을 고른 경우에만 언급한다
- 쉬운 한국어 존댓말("~해요")로 쓰고, 영어·유행어·이모지는 쓰지 않는다
- 장소를 모두 나열하지 말고, 이 사람들에게 왜 맞는지를 쓴다
- 문장만 답한다 (따옴표, 머리말 없이)

[정보]
코스: ${i.title} — ${i.summary}
도시: ${i.city}
함께 가는 사람: ${who}
이동: ${i.transport === 'car' ? '자가용' : '대중교통'}, 장소 사이 이동 모두 합쳐 약 ${i.totalMinutes}분
가는 곳 (방문 순서):
${places}
뺀 곳:
${dropped}`
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return json({ error: '서버에 GEMINI_API_KEY가 설정되지 않았습니다.' }, 500)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: 'JSON 본문이 필요합니다.' }, 400)
  }
  if (!isInput(body)) return json({ error: '입력 형식이 맞지 않습니다.' }, 400)

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: buildPrompt(body) }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 200 },
    }),
  })
  if (!res.ok) return json({ error: `Gemini 호출 실패 (${res.status})` }, 502)

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const reason = data.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? '')
    .join('')
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, '')
  if (!reason) return json({ error: '추천 이유를 만들지 못했습니다.' }, 502)

  return json({ reason })
}
