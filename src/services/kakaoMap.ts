/**
 * 카카오 지도 SDK를 한 번만 불러온다.
 * VITE_KAKAO_JS_KEY는 카카오에 등록한 도메인에서만 동작하는 브라우저용 키다.
 */

const SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

let loading: Promise<typeof kakao> | null = null

export function loadKakaoMap(): Promise<typeof kakao> {
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_JS_KEY
    if (!key) {
      reject(new Error('VITE_KAKAO_JS_KEY가 설정되지 않았습니다.'))
      return
    }

    const script = document.createElement('script')
    script.src = `${SDK_URL}?appkey=${key}&autoload=false`
    script.async = true
    script.onload = () => {
      const sdk = window.kakao
      if (!sdk) {
        reject(new Error('카카오 지도 SDK를 불러오지 못했습니다.'))
        return
      }
      sdk.maps.load(() => resolve(sdk))
    }
    script.onerror = () => reject(new Error('카카오 지도 SDK를 불러오지 못했습니다.'))
    document.head.appendChild(script)
  })

  // 실패하면 다음에 다시 시도할 수 있게 비운다
  loading.catch(() => {
    loading = null
  })

  return loading
}
