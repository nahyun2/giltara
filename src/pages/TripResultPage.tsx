import { useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import Icon from '../components/Icon'
import { courses } from '../data/courses'
import { planCourse, useCourseReason } from '../hooks/useCustomCourse'
import { formatDate, isComplete, parseConditions, toSearchParams } from '../hooks/useTripConditions'
import type { Course } from '../types/course'
import {
  CHECK_ITEM_LABEL,
  DROP_REASON_LABEL,
  PEOPLE_MAX,
  TRANSPORT_LABEL,
  type TripConditions,
} from '../types/trip'

/**
 * 맞춤 코스 결과 화면.
 * #20: 규칙 기반으로 고른 코스와 Gemini 추천 이유를 보여준다. 화면 디자인은 #21에서 다듬는다.
 */
export default function TripResultPage() {
  const { courseId } = useParams()
  const [params] = useSearchParams()
  const course = courses.find((c) => c.id === courseId)
  const conditions = parseConditions(params)

  if (!course) return <Navigate to="/" replace />
  // 조건이 빠졌으면 조건 입력의 확인 단계로 보낸다
  if (!isComplete(conditions)) {
    return <Navigate to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`} replace />
  }

  return <Result course={course} conditions={conditions} />
}

function Result({ course, conditions }: { course: Course; conditions: TripConditions }) {
  const plan = useMemo(() => planCourse(course, conditions), [course, conditions])
  const reason = useCourseReason(course, plan, conditions)

  const people = conditions.people === PEOPLE_MAX ? `${PEOPLE_MAX}명 이상` : `${conditions.people}명`
  const together = [conditions.wheelchair && '휠체어', conditions.pet && '반려견'].filter(Boolean).join('·')
  const summary = [formatDate(conditions.date), people, TRANSPORT_LABEL[conditions.transport], together]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-12">
      <Link
        to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`}
        className="inline-flex h-touch items-center gap-2 self-start rounded-lg pr-3 text-body font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
      >
        <Icon name="back" className="size-6" />
        조건 고치기
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-caption text-text-sub">{summary}</p>
        <h1 className="text-screen-title font-bold text-text">{course.title}</h1>
      </header>

      <section aria-label="추천 이유" className="rounded-2xl bg-card p-5 shadow-md">
        <p className="text-body text-text">{reason.text}</p>
      </section>

      <section aria-labelledby="plan-heading" className="flex flex-col gap-3">
        <h2 id="plan-heading" className="text-card-title font-bold text-text">
          가는 순서 <span className="text-primary">{plan.places.length}곳</span> · 이동 약 {plan.totalMinutes}분
        </h2>
        <ol className="flex flex-col gap-2">
          {plan.places.map((place, i) => {
            const check = plan.checks.find((c) => c.place === place)
            return (
              <li key={place.order} className="flex flex-col gap-2">
                <div className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-md">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
                    {i + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-card-title font-bold text-text">{place.name}</p>
                    {check && (
                      <p className="text-caption font-bold text-accent">
                        확인 필요: {check.items.map((it) => CHECK_ITEM_LABEL[it]).join(', ')} 정보가 없어요
                      </p>
                    )}
                  </div>
                </div>
                {plan.legs[i] && (
                  <p className="pl-6 text-caption text-text-sub">
                    ↓ {TRANSPORT_LABEL[conditions.transport]}로 약 {plan.legs[i].minutes}분
                  </p>
                )}
              </li>
            )
          })}
        </ol>
      </section>

      {plan.dropped.length > 0 && (
        <section aria-labelledby="dropped-heading" className="flex flex-col gap-2">
          <h2 id="dropped-heading" className="text-card-title font-bold text-text">
            이번에 뺀 곳
          </h2>
          <ul className="flex flex-col gap-1 text-body text-text-sub">
            {plan.dropped.map((d) => (
              <li key={d.place.order}>
                {d.place.name} — {DROP_REASON_LABEL[d.reason]}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-caption text-text-sub">
        이동 시간은 장소 사이 거리로 어림한 값이에요. 실제 경로는 여행 당일 안내에서 확인해요.
      </p>
    </div>
  )
}
