# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

- **서비스**: 중장년이 TV 여행 프로그램에 나온 코스를 자신의 조건에 맞게 바꿔, 예약과 이동까지 한 번에 준비할 수 있는 웹앱 (girtara, "5060 힐링 여행 가이드")
- **대상 사용자**: 50~70대 중장년. 대표 페르소나는 스마트폰 기본 사용이 가능한 은퇴한 60대 부부
- **핵심 사용자 흐름**: TV 코스 선택 → 조건 입력(날짜, 인원, 이동수단, 휠체어·반려견 동반) → 맞춤 코스 생성 → 예약 필요 장소 안내 → 코스 확정
- **현재 상태**: 초기 세팅 단계. `src/App.tsx`는 아직 Vite 기본 템플릿이다.
- git 저장소는 이 폴더(`girtara/girtara`)다. 상위 `girtara/` 폴더는 버전 관리 대상이 아니다.

## 기능 우선순위

아래 순서대로 개발한다. 앞 기능이 완성되기 전에 뒤 기능을 시작하지 않는다.

1. TV 여행 코스 보여주기 (추천 코스 배너)
2. 조건 맞춤 코스 생성 (하루 3~4개 장소)
3. 예약 안내 및 완료 표시 (원터치 전화, 예약 페이지 바로가기, 체크리스트)
4. 당일 이동경로 안내
5. 마이페이지 / 코스 저장

## 디자인 원칙 (중장년 사용성)

모든 화면에 아래 원칙을 적용한다.

- 본문 글씨는 최소 18px, 주요 버튼 글씨는 20px 이상
- 버튼 등 터치 영역은 최소 48px 높이
- 배경과 글자의 명도 대비를 충분히 확보한다 (WCAG AA 이상)
- 한 화면에는 주요 행동 하나만 둔다
- 입력 단계를 최소화하고, 직접 입력보다 선택형(버튼, 체크박스)을 우선한다
- 영어나 전문 용어 대신 쉬운 한국어를 쓴다 (예: "로그인" 대신 "내 정보 보기"처럼 행동 중심 문구 고려)
- 아이콘만 단독으로 쓰지 않고 항상 글자 라벨을 함께 표시한다

## 명령어

- `npm run dev` — Vite 개발 서버 (HMR)
- `npm run build` — `tsc -b`로 타입 검사 후 `vite build`로 `dist/`에 빌드
- `npm run lint` — ESLint (`eslint.config.js`, flat config)
- `npm run preview` — 빌드 결과를 로컬에서 확인

테스트 도구는 아직 설정되어 있지 않다.

## 기술 스택

- React 19 + TypeScript 6.0 + Vite 8 (`@vitejs/plugin-react`)
- 배포: Vercel (`main` 브랜치 push 시 자동 배포. 따라서 `main`에 push하면 곧바로 배포된다)
- 장소 검색·지도: 카카오 API
- 대중교통 경로: ODsay API
- 코스 데이터 추출: Claude API

명시되지 않은 라이브러리를 새로 설치해야 할 때는 먼저 이유를 설명하고 확인을 받는다. 현재 라우터, 상태관리, CSS 프레임워크는 없고 스타일은 일반 CSS(`src/index.css`, `src/App.css`)다.

**TypeScript는 6.0 버전을 유지한다.** 7.x는 typescript-eslint와 호환되지 않아 설치 오류가 발생했다.

### 코드 작성에 영향을 주는 설정

- 진입점: `index.html` → `src/main.tsx` → `src/App.tsx` (`StrictMode`로 렌더링)
- tsconfig는 프로젝트 참조 구조다. `tsconfig.app.json`은 `src/`, `tsconfig.node.json`은 `vite.config.ts`를 담당한다. 새로 만들 `api/` 폴더는 어느 쪽에도 포함되어 있지 않으므로, 서버 함수를 추가할 때 타입 검사 범위를 따로 정해야 한다.
- `verbatimModuleSyntax` — 타입만 가져올 때는 `import type`을 쓴다.
- `erasableSyntaxOnly` — `enum`, `namespace`, 생성자 매개변수 속성을 쓰지 않는다. 대신 유니온 타입이나 일반 객체를 쓴다.
- `noUnusedLocals` / `noUnusedParameters` — 사용하지 않는 변수·매개변수가 있으면 `npm run build`가 실패한다.
- ESLint `react-refresh` 규칙 — 컴포넌트 파일에서는 컴포넌트만 export해야 HMR이 동작한다.
- 정적 파일: `public/`은 루트 경로로 제공되고(예: `/icons.svg#...`), `src/assets/`는 import해서 번들러를 거친다.

## 폴더 구조 (예정)

아직 만들어지지 않은 목표 구조다. 새 파일은 이 구조에 맞춰 만든다.

```
api/                # Vercel 서버 함수 (API 키가 필요한 외부 호출)
src/
  components/       # 재사용 UI 컴포넌트
  pages/            # 화면 단위 컴포넌트
  services/         # 외부 API 호출 함수 (클라이언트용)
  data/             # TV 코스 등 정적 데이터 (JSON)
  types/            # TypeScript 타입 정의
  hooks/            # 커스텀 훅
```

## 보안 규칙

- API 키를 코드에 직접 작성하지 않는다. 항상 환경 변수를 사용한다.
- `VITE_`로 시작하는 환경 변수는 브라우저에 노출된다. 노출되어도 되는 키(카카오 JavaScript 키 등)에만 사용한다.
- Claude API, ODsay 등 노출되면 안 되는 키는 `api/` 폴더의 서버 함수에서만 사용한다.
- `.env`, `.env.local` 파일은 커밋하지 않는다. (`.gitignore`에서 `.env`, `.env.*`를 제외하고 있다.)

## 작업 규칙

- 한 번에 한 기능 또는 한 이슈만 작업한다.
- 작업 전에 수정할 파일과 방법을 먼저 간단히 설명한다.
- 수정 후 `npm run build`로 타입 오류와 빌드 오류가 없는지 확인한다.
- 오류가 나면 원인을 먼저 설명하고, 오류를 무시하는 옵션(`--force`, `@ts-ignore`, `any` 남용)으로 해결하지 않는다.
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

## 데이터 규칙

- TV 코스 데이터에는 장소명, 지역, 방문 순서 등 사실 정보만 저장한다.
- 방송 이미지, 영상, 프로그램 로고는 사용하지 않는다.
