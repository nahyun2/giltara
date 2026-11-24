/// <reference types="vite/client" />

/** 브라우저 코드에서 쓰는 환경 변수 (도메인 제한으로 보호되는 키만) */
interface ImportMetaEnv {
  readonly VITE_KAKAO_JS_KEY?: string
  readonly VITE_ODSAY_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
