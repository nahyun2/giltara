import { useEffect, useRef, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import ChoiceButton from '../components/ChoiceButton'
import Icon from '../components/Icon'
import { courses } from '../data/courses'
import {
  formatDate,
  isComplete,
  toDateString,
  toSearchParams,
  upcomingWeekendDates,
  useTripConditions,
} from '../hooks/useTripConditions'
import { PEOPLE_MAX, PEOPLE_OPTIONS, TRANSPORT_LABEL, type Transport } from '../types/trip'

const TOTAL_STEPS = 5
/** 고른 것을 눈으로 확인할 시간 (ms). 그다음 자동으로 넘어간다 */
const AUTO_NEXT_DELAY = 400
const AUTO_NEXT_HINT = '하나를 고르면 바로 다음 단계로 넘어가요.'

const SECONDARY_BUTTON =
  'flex h-button items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-button font-bold text-primary transition-colors hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]'

const PRIMARY_BUTTON =
  'flex h-button w-full items-center justify-center gap-2 rounded-xl text-button font-bold shadow-md transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark'

function peopleLabel(n: number): string {
  return n === PEOPLE_MAX ? `${n}명 이상` : `${n}명`
}

/** 여행 조건 입력: 한 단계에 질문 하나 */
export default function TripPlanPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = courses.find((c) => c.id === courseId)
  const { conditions, step, editing, nextStep, update, goTo } = useTripConditions(TOTAL_STEPS)
  // 고치는 중에는 이전 버튼 없이 "수정 완료"만 둔다
  const showPrev = step > 1 && !editing
  const autoNextTimer = useRef<number | undefined>(undefined)

  // 단계가 바뀌면 맨 위에서 시작하고, 기다리던 자동 넘김은 취소한다
  useEffect(() => {
    window.scrollTo(0, 0)
    return () => window.clearTimeout(autoNextTimer.current)
  }, [step])

  /** 1~3단계 선택: 체크를 잠깐 보여준 뒤 다음 단계로 */
  const chooseAndNext = (patch: Parameters<typeof update>[0]) => {
    update(patch)
    window.clearTimeout(autoNextTimer.current)
    autoNextTimer.current = window.setTimeout(() => goTo(nextStep, patch), AUTO_NEXT_DELAY)
  }

  if (!course) return <Navigate to="/" replace />

  const weekendDates = upcomingWeekendDates()
  const today = toDateString(new Date())

  /** 각 단계: 질문, 선택지, 다음으로 갈 수 있는지 */
  const steps: Record<number, { question: string; hint?: string; body: ReactNode; canNext: boolean }> = {
    1: {
      question: '언제 가세요?',
      // 달력으로 고른 날짜는 자동으로 넘어가지 않는다 (돌리는 도중 값이 바뀔 수 있음)
      hint: '날짜를 고르면 바로 다음 단계로 넘어가요. 달력에서 고른 날짜는 아래 다음 버튼을 눌러 주세요.',
      canNext: conditions.date !== undefined,
      body: (
        <div className="flex flex-col gap-3">
          {weekendDates.map((d) => (
            <ChoiceButton
              key={d}
              icon="calendar"
              selected={conditions.date === d}
              onClick={() => chooseAndNext({ date: d })}
            >
              {formatDate(d)}
            </ChoiceButton>
          ))}
          {conditions.date && !weekendDates.includes(conditions.date) && (
            <ChoiceButton icon="calendar" selected onClick={() => {}}>
              {formatDate(conditions.date)}
            </ChoiceButton>
          )}
          <label className="flex flex-col gap-2 pt-2">
            <span className="text-body font-bold text-text">다른 날짜 고르기</span>
            <input
              type="date"
              min={today}
              value={conditions.date && !weekendDates.includes(conditions.date) ? conditions.date : ''}
              onChange={(e) => e.target.value && update({ date: e.target.value })}
              className="h-button w-full rounded-xl border-2 border-chip bg-card px-4 text-body text-text focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            />
          </label>
        </div>
      ),
    },
    2: {
      question: '몇 분이 가세요?',
      hint: AUTO_NEXT_HINT,
      canNext: conditions.people !== undefined,
      body: (
        <div className="grid grid-cols-2 gap-3">
          {PEOPLE_OPTIONS.map((n) => (
            <ChoiceButton key={n} selected={conditions.people === n} onClick={() => chooseAndNext({ people: n })}>
              {peopleLabel(n)}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    3: {
      question: '어떻게 이동하세요?',
      hint: AUTO_NEXT_HINT,
      canNext: conditions.transport !== undefined,
      body: (
        <div className="flex flex-col gap-3">
          {(['car', 'transit'] as Transport[]).map((t) => (
            <ChoiceButton
              key={t}
              icon={t === 'car' ? 'car' : 'bus'}
              selected={conditions.transport === t}
              onClick={() => chooseAndNext({ transport: t })}
            >
              {TRANSPORT_LABEL[t]}
            </ChoiceButton>
          ))}
        </div>
      ),
    },
    4: {
      question: '함께 가는 분이 있나요?',
      hint: '해당하는 것을 모두 골라 주세요. 없으면 바로 다음을 누르세요.',
      canNext: true,
      body: (
        <div className="flex flex-col gap-3">
          <ChoiceButton
            icon="wheelchair"
            selected={conditions.wheelchair === true}
            onClick={() => update({ wheelchair: !conditions.wheelchair })}
          >
            휠체어를 이용해요
          </ChoiceButton>
          <ChoiceButton
            icon="paw"
            selected={conditions.pet === true}
            onClick={() => update({ pet: !conditions.pet })}
          >
            반려견과 함께 가요
          </ChoiceButton>
        </div>
      ),
    },
    5: {
      question: '이렇게 준비할까요?',
      canNext: isComplete(conditions),
      body: (
        <dl className="flex flex-col gap-3">
          {[
            { step: 1, icon: 'calendar' as const, label: '날짜', value: conditions.date && formatDate(conditions.date) },
            { step: 2, icon: 'people' as const, label: '인원', value: conditions.people && peopleLabel(conditions.people) },
            {
              step: 3,
              icon: conditions.transport === 'transit' ? ('bus' as const) : ('car' as const),
              label: '이동',
              value: conditions.transport && TRANSPORT_LABEL[conditions.transport],
            },
            {
              step: 4,
              icon: conditions.wheelchair
                ? ('wheelchair' as const)
                : conditions.pet
                  ? ('paw' as const)
                  : ('people' as const),
              label: '함께',
              value:
                [conditions.wheelchair && '휠체어 이용', conditions.pet && '반려견 동반']
                  .filter(Boolean)
                  .join(', ') || '없음',
            },
          ].map((row) => (
            <div key={row.step} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
              <Icon name={row.icon} className="size-6 shrink-0 text-primary" />
              <div className="flex flex-1 flex-col">
                <dt className="text-caption text-text-sub">{row.label}</dt>
                <dd className={`text-body font-bold ${row.value ? 'text-text' : 'text-accent'}`}>
                  {row.value || '아직 고르지 않았어요'}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => goTo(row.step, {}, true)}
                className="h-touch shrink-0 rounded-lg px-3 text-body font-bold text-primary underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
              >
                고치기<span className="sr-only"> ({row.label})</span>
              </button>
            </div>
          ))}
        </dl>
      ),
    },
  }

  const current = steps[step]
  const isLast = step === TOTAL_STEPS
  // 고치는 중이면 어디로 돌아가는지 알려준다
  const hint = editing
    ? step === 4
      ? '고친 뒤 아래 수정 완료를 누르면 확인 화면으로 돌아가요.'
      : '고르면 바로 확인 화면으로 돌아가요.'
    : current.hint

  const handleNext = () => {
    if (!current.canNext) return
    if (!isLast) {
      goTo(nextStep)
      return
    }
    if (isComplete(conditions)) {
      navigate(`/course/${course.id}/result?${toSearchParams(conditions)}`)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-8">
      {/* 위쪽은 언제나 코스로 돌아가기. 앞 단계로는 아래 "이전" 버튼으로 간다 */}
      <Link
        to={`/course/${course.id}`}
        className="inline-flex h-touch items-center gap-2 self-start rounded-lg pr-3 text-body font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
      >
        <Icon name="back" className="size-6" />
        코스로 돌아가기
      </Link>

      <div className="flex flex-col gap-3">
        <p className="text-caption text-text-sub">{course.title}</p>
        {/* 진행 정도 */}
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span key={i} className={`h-2 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-chip'}`} />
            ))}
          </div>
          <p className="text-caption font-bold text-primary">
            {step} / {TOTAL_STEPS} 단계
          </p>
        </div>
      </div>

      <section aria-labelledby="step-question" className="flex flex-col gap-4">
        <h1 id="step-question" className="text-screen-title font-bold text-text">
          {current.question}
        </h1>
        {hint && <p className="text-body text-text-sub">{hint}</p>}
        {current.body}
      </section>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        {!current.canNext && (
          <p className="text-center text-body text-text-sub">
            {isLast ? '고르지 않은 항목을 먼저 골라 주세요.' : '하나를 골라 주세요.'}
          </p>
        )}
        {/* 이전 1칸 : 다음 2칸 */}
        <div className="grid grid-cols-3 gap-3">
          {showPrev && (
            <button type="button" onClick={() => goTo(step - 1)} className={SECONDARY_BUTTON}>
              <Icon name="back" className="size-6" />
              이전
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!current.canNext}
            className={`${PRIMARY_BUTTON} ${showPrev ? 'col-span-2' : 'col-span-3'} ${
              current.canNext
                ? 'bg-primary text-on-color hover:bg-primary-dark active:scale-[0.98]'
                : 'cursor-not-allowed bg-chip text-text-sub shadow-none'
            }`}
          >
            {isLast ? '맞춤 코스 만들기' : editing ? '수정 완료' : '다음'}
            <Icon name="arrow" className="size-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
