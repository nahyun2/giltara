import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import Icon from '../components/Icon'
import RouteSteps from '../components/RouteSteps'
import { courses } from '../data/courses'
import { planCourse } from '../hooks/useCustomCourse'
import { formatDate, isComplete, parseConditions, toSearchParams } from '../hooks/useTripConditions'
import type { Course } from '../types/course'
import { TRANSPORT_LABEL, type TripConditions } from '../types/trip'

/** 당일 이동 안내: 장소 → 장소마다 가는 방법 (#38) */
export default function RoutePage() {
  const { courseId } = useParams()
  const [params] = useSearchParams()
  const course = courses.find((c) => c.id === courseId)
  const conditions = useMemo(() => parseConditions(params), [params])

  if (!course) return <Navigate to="/" replace />
  if (!isComplete(conditions)) {
    return <Navigate to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`} replace />
  }
  return <Route course={course} conditions={conditions} />
}

function Route({ course, conditions }: { course: Course; conditions: TripConditions }) {
  const query = toSearchParams(conditions).toString()
  const plan = useMemo(() => planCourse(course, conditions), [course, conditions])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [query])

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-6 px-4 pt-5 pb-12">
      <Link
        to={`/course/${course.id}/result?${query}`}
        className="inline-flex h-touch items-center gap-2 self-start rounded-lg pr-3 text-body font-bold text-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-dark"
      >
        <Icon name="back" className="size-6" />
        맞춤 코스로
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-caption text-text-sub">
          {course.title} · {formatDate(conditions.date)}
        </p>
        <h1 className="text-screen-title font-bold text-text">가는 길 안내</h1>
        <p className="text-body text-text-sub">
          {TRANSPORT_LABEL[conditions.transport]}로 {plan.places.length}곳을 다녀요. 장소 사이 이동은 모두 합쳐 약{' '}
          <strong className="text-text">{plan.totalMinutes}분</strong>이에요.
        </p>
      </header>

      <ol className="flex flex-col">
        {plan.places.map((place, i) => {
          const leg = plan.legs[i]
          return (
            <li key={place.name} className="flex flex-col">
              {/* 장소 */}
              <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-md">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-body font-bold text-on-color">
                  {i + 1}
                  <span className="sr-only">번째</span>
                </span>
                <div className="flex flex-col">
                  <p className="text-card-title font-bold text-text">{place.name}</p>
                  <p className="text-caption text-text-sub">{place.address ?? place.district}</p>
                </div>
              </div>

              {/* 다음 장소까지 */}
              {leg && (
                <div className="ml-8 flex flex-col gap-3 border-l-2 border-dashed border-primary py-4 pl-6">
                  <p className="text-caption font-bold text-primary">
                    {plan.places[i + 1].name}까지
                  </p>
                  {leg.route ? (
                    <RouteSteps route={leg.route} />
                  ) : (
                    <p className="flex items-center gap-2 text-body text-text">
                      <Icon name={conditions.transport === 'car' ? 'car' : 'bus'} className="size-6 shrink-0 text-primary" />
                      {TRANSPORT_LABEL[conditions.transport]}로 약 {leg.minutes}분 ({leg.km}km)
                    </p>
                  )}
                  {leg.estimated && (
                    <p className="text-caption text-text-sub">거리로 어림한 시간이에요.</p>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <p className="text-caption text-text-sub">
        대중교통 경로는 미리 받아 둔 정보라 버스 도착 시간은 나오지 않아요. 노선이 바뀌었을 수 있으니 출발 전에 한 번 더
        확인해 주세요.
      </p>
    </div>
  )
}
