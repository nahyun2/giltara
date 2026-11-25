import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import AccessInfo from '../components/AccessInfo'
import CourseMap from '../components/CourseMap'
import Icon, { type IconName } from '../components/Icon'
import PlaceCard from '../components/PlaceCard'
import { courses } from '../data/courses'
import { planCourse, useCourseReason } from '../hooks/useCustomCourse'
import { formatDate, isComplete, parseConditions, toSearchParams } from '../hooks/useTripConditions'
import type { Course } from '../types/course'
import { DROP_REASON_LABEL, PEOPLE_MAX, TRANSPORT_LABEL, type TripConditions } from '../types/trip'

/** 맞춤 코스 결과: 추천 이유 → 지도 → 가는 순서(이동 시간) → 뺀 곳 */
export default function TripResultPage() {
  const { courseId } = useParams()
  const [params] = useSearchParams()
  const course = courses.find((c) => c.id === courseId)
  // 주소가 바뀔 때만 새로 만든다 (지도·추천 이유가 렌더마다 다시 그려지지 않게)
  const conditions = useMemo(() => parseConditions(params), [params])

  if (!course) return <Navigate to="/" replace />
  // 조건이 빠졌으면 조건 입력의 확인 단계로 보낸다
  if (!isComplete(conditions)) {
    return <Navigate to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`} replace />
  }

  return <Result course={course} conditions={conditions} />
}

function Result({ course, conditions }: { course: Course; conditions: TripConditions }) {
  const plan = useMemo(() => planCourse(course, conditions), [course, conditions])
  // 결과 화면에서는 고른 장소만 1번부터 다시 번호를 매긴다 (지도 마커도 같은 번호)
  const numbered = useMemo(() => plan.places.map((p, i) => ({ ...p, order: i + 1 })), [plan])
  const reason = useCourseReason(course, plan, conditions)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [conditions])

  const chips: { icon: IconName; label: string }[] = [
    { icon: 'calendar', label: formatDate(conditions.date) },
    {
      icon: 'people',
      label: conditions.people === PEOPLE_MAX ? `${PEOPLE_MAX}명 이상` : `${conditions.people}명`,
    },
    { icon: conditions.transport === 'car' ? 'car' : 'bus', label: TRANSPORT_LABEL[conditions.transport] },
    ...(conditions.wheelchair ? [{ icon: 'wheelchair' as const, label: '휠체어' }] : []),
    ...(conditions.pet ? [{ icon: 'paw' as const, label: '반려견' }] : []),
  ]

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-32">
      <Link
        to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`}
        className="inline-flex h-touch items-center gap-2 self-start rounded-lg pr-3 text-body font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
      >
        <Icon name="back" className="size-6" />
        조건 고치기
      </Link>

      <header className="flex flex-col gap-3">
        <p className="inline-flex items-center gap-1.5 self-start rounded-lg bg-accent px-3 py-1 text-caption font-bold text-on-color">
          <Icon name="tv" className="size-5" />
          {course.program} {course.episode}회 · {course.city}
        </p>
        <h1 className="text-screen-title font-bold text-text">{course.title}</h1>
        <ul aria-label="고른 조건" className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-chip px-3 py-1 text-caption font-bold text-text"
            >
              <Icon name={chip.icon} className="size-5 text-primary" />
              {chip.label}
            </li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="reason-heading" className="flex flex-col gap-2 rounded-2xl bg-card p-5 shadow-md">
        <h2 id="reason-heading" className="text-body font-bold text-primary">
          이 코스를 추천하는 이유
        </h2>
        <p aria-live="polite" className="text-body text-text">
          {reason.text}
        </p>
        {reason.fromAi && <p className="text-caption text-text-sub">AI가 쓴 글이에요. 자세한 내용은 아래 장소 정보를 확인해 주세요.</p>}
      </section>

      <CourseMap places={numbered} />

      <section aria-labelledby="plan-heading" className="flex flex-col gap-4">
        <h2 id="plan-heading" className="text-screen-title font-bold text-text">
          가는 순서 <span className="text-primary">{numbered.length}곳</span>
        </h2>
        <p className="-mt-2 text-body text-text-sub">
          장소 사이 이동은 모두 합쳐 약 <strong className="text-text">{plan.totalMinutes}분</strong>이에요.{' '}
          <Link
            to={`/course/${course.id}/route?${toSearchParams(conditions)}`}
            className="inline-flex h-touch items-center font-bold text-primary underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
          >
            가는 길 자세히 보기
          </Link>
        </p>
        {plan.tooFew && (
          <div className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-md">
            <p className="text-body font-bold text-accent">
              이 날은 {numbered.length}곳만 갈 수 있어요. 다른 날을 고르면 더 많은 곳에 갈 수 있어요.
            </p>
            <Link
              to={`/course/${course.id}/plan?${toSearchParams(conditions, 1)}&edit=1`}
              className="flex h-touch items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card text-body font-bold text-primary hover:bg-bg focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
            >
              <Icon name="calendar" className="size-5" />
              날짜 바꾸기
            </Link>
          </div>
        )}
        <ol className="flex flex-col">
          {numbered.map((place, i) => {
            const restNote = plan.checks.find((x) => x.place.name === place.name)?.restNote
            return (
            <li key={place.order} className="flex flex-col">
              <PlaceCard
                place={place}
                extra={
                  <>
                    {restNote && (
                      <p className="rounded-xl bg-bg p-4 text-caption font-bold text-accent">
                        확인 필요 · {restNote}
                      </p>
                    )}
                    <AccessInfo place={place} wheelchair={conditions.wheelchair} pet={conditions.pet} />
                  </>
                }
              />
              {plan.legs[i] && (
                <p className="flex items-center gap-2 py-3 pl-6 text-body text-text-sub">
                  <span aria-hidden="true" className="h-8 border-l-2 border-dashed border-primary" />
                  {plan.legs[i].route?.kind === 'walk' ? (
                    <>
                      <Icon name="walk" className="size-5 text-primary" />
                      걸어서 약 {plan.legs[i].minutes}분
                    </>
                  ) : (
                    <>
                      <Icon name={conditions.transport === 'car' ? 'car' : 'bus'} className="size-5 text-primary" />
                      {TRANSPORT_LABEL[conditions.transport]}로 약 {plan.legs[i].minutes}분
                    </>
                  )}
                </p>
              )}
            </li>
            )
          })}
        </ol>
        <p className="text-caption text-text-sub">
          이동 시간은 장소 사이 거리로 어림한 값이에요. 실제 경로와 시간은 여행 당일 안내에서 확인할 수 있어요.
        </p>
      </section>

      {plan.dropped.length > 0 && (
        <section aria-labelledby="dropped-heading" className="flex flex-col gap-2 rounded-2xl bg-chip p-5">
          <h2 id="dropped-heading" className="text-body font-bold text-text">
            방송에는 나왔지만 이번에 뺀 곳
          </h2>
          <ul className="flex flex-col gap-1 text-body text-text-sub">
            {plan.dropped.map((d) => (
              <li key={d.place.order}>
                <strong className="text-text">{d.place.name}</strong> — {d.note ?? DROP_REASON_LABEL[d.reason]}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 이 화면의 주요 행동: 화면 아래에 고정 */}
      <div className="fixed inset-x-0 bottom-0 bg-card shadow-md">
        <div className="mx-auto w-full max-w-page px-4 py-3">
          <Link
            to={`/course/${course.id}/checklist?${toSearchParams(conditions)}`}
            className="flex h-button w-full items-center justify-center gap-2 rounded-xl bg-primary text-button font-bold text-on-color shadow-md transition-colors hover:bg-primary-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark active:scale-[0.98]"
          >
            가기 전 확인하기
            <Icon name="arrow" className="size-6" />
          </Link>
        </div>
      </div>
    </div>
  )
}
