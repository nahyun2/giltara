# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

- **서비스**: 장년이 TV 여행 프로그램에 나온 코스를 자신의 조건에 맞게 바꿔, 예약과 이동까지 한 번에 준비할 수 있는 웹앱 (giltara, 길따라)
- **대상 사용자**: 50~70대 장년. 대표 페르소나는 스마트폰 기본 사용이 가능한 은퇴한 60대 부부
- **핵심 사용자 흐름**: TV 코스 선택 → 조건 입력(날짜, 인원, 이동수단, 휠체어·반려견 동반) → 맞춤 코스 생성 → 예약 필요 장소 안내 → 코스 확정
- **현재 상태**: 메인 화면(코스 카드 목록, 프로그램·도시 필터) 구현 완료. 코스 데이터는 <동네 한 바퀴> 6개 회차를 추출·검수한 `src/data/courses.json`을 쓴다 (장소 좌표·사진은 아직 없음).
- git 저장소는 이 폴더(`giltara/giltara`)다. 상위 `giltara/` 폴더는 버전 관리 대상이 아니다.
- 위키 저장소는 옆 폴더 `../giltara.wiki`에 있다. Claude Code는 항상 이 프로젝트 폴더에서 실행한다.

## 기능 우선순위

아래 순서대로 개발한다. 앞 기능이 완성되기 전에 뒤 기능을 시작하지 않는다.

1. TV 여행 코스 보여주기 (추천 코스 배너)
2. 조건 맞춤 코스 생성 (하루 3~4개 장소)
3. 예약 안내 및 완료 표시 (원터치 전화, 예약 페이지 바로가기, 체크리스트)
4. 당일 이동경로 안내
5. 마이페이지 / 코스 저장

## 디자인 원칙 (장년 사용성)

모든 화면에 아래 원칙을 적용한다.

- 본문 글씨는 최소 18px, 주요 버튼 글씨는 20px 이상
- 버튼 등 터치 영역은 최소 48px 높이
- 배경과 글자의 명도 대비를 충분히 확보한다 (WCAG AA 이상)
- 한 화면에는 주요 행동 하나만 둔다
- 입력 단계를 최소화하고, 직접 입력보다 선택형(버튼, 체크박스)을 우선한다
- 영어나 전문 용어 대신 쉬운 한국어를 쓴다 (예: "로그인" 대신 "내 정보 보기"처럼 행동 중심 문구 고려)
- 아이콘만 단독으로 쓰지 않고 항상 글자 라벨을 함께 표시한다

### 디자인 토큰

- 색, 글씨 크기, 터치·버튼 높이 등은 `src/index.css`의 `@theme` 한 곳에만 정의한다.
- Tailwind 기본 색은 꺼 두었다(`--color-*: initial`). 컴포넌트에서는 토큰 클래스만 쓰고, 임의 값(`text-[17px]`, `#hex` 등)을 쓰지 않는다.
- 새 값이 필요하면 먼저 `@theme`에 토큰을 추가한다.

## 명령어

- `npm run dev` — Vite 개발 서버 (HMR). `api/` 서버 함수는 실행되지 않는다
- `npx vercel dev` — `api/` 서버 함수까지 함께 실행하는 로컬 서버 (Vercel CLI, devDependency)
- `npm run build` — `tsc -b`로 타입 검사 후 `vite build`로 `dist/`에 빌드
- `npm run lint` — ESLint (`eslint.config.js`, flat config)
- `npm run preview` — 빌드 결과를 로컬에서 확인

테스트 도구는 아직 설정되어 있지 않다.

## 기술 스택

- React 19 + TypeScript 6.0 + Vite 8 (`@vitejs/plugin-react`)
- 스타일: Tailwind CSS 4 (`@tailwindcss/vite`)
- 배포: Vercel (아래 "브랜치와 배포" 참고)
- 장소 검색·지도: 카카오 API
- 대중교통 경로: ODsay API
- 코스 데이터 추출: Gemini API
- 장소 사진: 한국관광공사 TourAPI (사용 예정, 키 미발급)
- 화면 이동: React Router 8 (`react-router`에서 import, `BrowserRouter` + `Routes` 선언형)

명시되지 않은 라이브러리를 새로 설치해야 할 때는 먼저 이유를 설명하고 확인을 받는다. 상태관리 라이브러리는 없다.

**TypeScript는 6.0 버전을 유지한다.** 7.x는 typescript-eslint와 호환되지 않아 설치 오류가 발생했다.

### 코드 작성에 영향을 주는 설정

- 진입점: `index.html` → `src/main.tsx` → `src/App.tsx` (`StrictMode`로 렌더링). 화면 주소는 `App.tsx`의 `Routes`에서 정한다 (`/` 메인, `/course/:courseId` 코스 상세)
- `vercel.json`이 `/api/`를 뺀 모든 주소를 `index.html`로 보낸다. 배포에서 상세 화면 주소로 바로 들어가거나 새로고침해도 404가 나지 않게 하기 위함이다
- tsconfig는 프로젝트 참조 구조다. `tsconfig.app.json`은 `src/`, `tsconfig.node.json`은 `vite.config.ts`, `tsconfig.api.json`은 `api/`(Vercel 서버 함수)를 담당한다. ESLint도 `api/`는 Node 전역 기준으로 검사한다.
- 서버 함수는 Web 표준 형식(`export async function GET(request: Request): Promise<Response>`)으로 작성한다.
- `verbatimModuleSyntax` — 타입만 가져올 때는 `import type`을 쓴다.
- `erasableSyntaxOnly` — `enum`, `namespace`, 생성자 매개변수 속성을 쓰지 않는다. 대신 유니온 타입이나 일반 객체를 쓴다.
- `noUnusedLocals` / `noUnusedParameters` — 사용하지 않는 변수·매개변수가 있으면 `npm run build`가 실패한다.
- ESLint `react-refresh` 규칙 — 컴포넌트 파일에서는 컴포넌트만 export해야 HMR이 동작한다.
- JSON import는 문자열 값을 리터럴 타입으로 추론하지 않는다. 코스 데이터는 `src/data/courses.ts` 한 곳에서만 `Course[]`로 지정해 내보내고, 화면은 이 파일에서 가져온다.
- 정적 파일: `public/`은 루트 경로로 제공되고(예: `/icons.svg#...`), `src/assets/`는 import해서 번들러를 거친다.

## 폴더 구조

새 파일은 이 구조에 맞춰 만든다. `services/`, `hooks/`는 아직 없다.

```
api/                # Vercel 서버 함수 (노출되면 안 되는 키를 쓰는 외부 호출)
src/
  components/       # 재사용 UI 컴포넌트
  pages/            # 화면 단위 컴포넌트
  services/         # 외부 API 호출 함수 (클라이언트용)
  data/             # TV 코스 등 정적 데이터 (JSON)
  types/            # TypeScript 타입 정의
  hooks/            # 커스텀 훅
docs/               # 시안, 보류 중인 결정 등 프로젝트 문서
```

## 브랜치와 배포

- `feature/이슈번호-설명` → `dev` → `main` 순서로 병합한다.
  - `dev`: 기본 브랜치. 통합 테스트용이며 Vercel **Preview**로 배포된다.
  - `main`: Vercel **Production**(https://giltara.vercel.app). 스프린트 종료 시에만 `dev`를 반영한다.
- **`main`과 `dev`에는 직접 커밋하거나 push하지 않는다.** 항상 feature 브랜치에서 작업하고 PR로 `dev`에 병합한다.
- PR 본문에 `closes #이슈번호`를 넣어 병합 시 이슈가 자동으로 닫히게 한다.
- feature 브랜치의 미리보기 주소는 배포마다 바뀌어 카카오·ODsay 허용 도메인에 등록할 수 없다. 지도·경로 기능은 로컬(`localhost:5173`)이나 dev 미리보기 주소에서 확인한다.

## 보안 규칙

- API 키를 코드에 직접 작성하지 않는다. 항상 환경 변수를 사용한다.
- `VITE_`로 시작하는 환경 변수는 빌드 시 브라우저 코드에 포함된다. 도메인 제한으로 보호되는 키에만 쓴다.
- 키별 사용 위치:

| 환경 변수 | 사용 위치 | 보호 방식 |
| --- | --- | --- |
| `VITE_KAKAO_JS_KEY` | 브라우저 (지도) | 카카오 등록 도메인에서만 동작 |
| `VITE_ODSAY_API_KEY` | 브라우저 (대중교통 경로) | ODsay URI(Web) 키, 등록 도메인에서만 동작 |
| `KAKAO_REST_API_KEY` | `api/` 서버 함수만 | 노출 금지 |
| `GEMINI_API_KEY` | `api/` 서버 함수만 | 노출 금지 |

- 새 키를 추가하면 이 표에 사용 위치를 먼저 적는다. TourAPI 키는 발급 후 추가한다.
- `.env`, `.env.local` 파일은 커밋하지 않는다. (`.gitignore`에서 `.env`, `.env.*`를 제외하고 있다.)

## ODsay 사용 규칙

무료 등급의 호출 한도가 **하루 30회**이므로 호출을 최소화한다.

- 코스 생성 단계의 이동 시간은 카카오 좌표 기반 직선거리로 추정하고, ODsay를 부르지 않는다.
- ODsay는 코스를 확정한 뒤, 또는 당일 경로를 조회할 때만 호출한다.
- 한 번 받은 경로는 저장해 두고 같은 경로를 다시 호출하지 않는다.
- 개발 중에는 실제 응답을 JSON으로 저장해 두고 그 데이터를 사용한다. 개발 중 실제 호출이 필요하면 먼저 확인을 받는다.

## 작업 규칙

- 한 번에 한 기능 또는 한 이슈만 작업한다.
- 작업 전에 수정할 파일과 방법을 먼저 간단히 설명한다.
- 수정 후 `npm run build`와 `npm run lint`로 오류가 없는지 확인한다.
- 오류가 나면 원인을 먼저 설명하고, 오류를 무시하는 옵션(`--force`, `@ts-ignore`, `any` 남용)으로 해결하지 않는다.
- 빌드와 린트가 통과하면 feature 브랜치에서 의미 있는 작업 단위마다 확인 없이 커밋한다. push와 PR 생성은 요청이 있을 때 한다.

## 커밋 규칙

커밋 메시지는 `타입: 내용 (#이슈번호)` 형식을 따른다.

- 예: `feat: 추천 코스 배너 컴포넌트 구현 (#3)`

| 타입 | 용도 |
| --- | --- |
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 |
| `style` | 코드 포맷팅, 세미콜론 누락 등 동작이 바뀌지 않는 변경 |
| `refactor` | 코드 리팩토링 (기능 변경 없음) |
| `test` | 누락된 테스트 추가 또는 기존 테스트 수정 |
| `chore` | 빌드 프로세스 또는 보조 도구 수정 (라이브러리 추가 등) |
| `perf` | 성능 향상 관련 변경 |
| `build` | 빌드 관련 파일 변경 |

## 기록 규칙

- **PR**: `.github/pull_request_template.md`를 따른다. PR을 만들기 전에 제목과 본문 초안을 보여주고 확인을 받는다. 직접 확인한 항목만 체크한다.
- **보류한 결정**: "나중에 정하자"고 한 내용은 `docs/pending-decisions.md`의 "보류 중"에 기록하고, 결정되면 "결정됨"으로 옮긴다.
- **위키 기록** (`../giltara.wiki`)
  - `/log`: Claude Code 작업의 프롬프트 로그(`프롬프트-로그-구현.md`)와 트러블슈팅을 기록한다. PR 초안을 쓰기 전에 실행한다.
  - `/retro 스프린트번호`: 스프린트 회고를 기록한다.
  - Claude와 나눈 기획 대화는 `프롬프트-로그-기획.md`에 사용자가 직접 기록한다.
  - API 키, 토큰, `.env` 값은 위키에 기록하지 않는다.

## 데이터 규칙

- TV 코스 데이터에는 장소명, 지역, 방문 순서 등 사실 정보만 저장한다.
- 코스 제목·한 줄 소개는 Gemini가 생성하되, 원문에 없는 사실은 쓰지 않는다.
- 방송 이미지, 영상, 프로그램 로고는 사용하지 않는다. 장소 사진은 TourAPI에서 가져온다.
