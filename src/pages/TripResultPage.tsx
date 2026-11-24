import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import Icon from '../components/Icon'
import { courses } from '../data/courses'
import { formatDate, isComplete, parseConditions, toSearchParams } from '../hooks/useTripConditions'
import { PEOPLE_MAX, TRANSPORT_LABEL } from '../types/trip'

/**
 * 맞춤 코스 결과 화면.
 * 임시 화면: 지금은 넘어온 조건만 보여준다. 맞춤 코스 생성(#20)과 결과 화면(#21)에서 채운다.
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

  const together =
    [conditions.wheelchair && '휠체어 이용', conditions.pet && '반려견 동반'].filter(Boolean).join(', ') || '없음'

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
        <p className="text-caption text-text-sub">{course.title}</p>
        <h1 className="text-screen-title font-bold text-text">맞춤 코스</h1>
      </header>

      <ul className="flex flex-col gap-2 rounded-2xl bg-card p-5 text-body text-text shadow-md">
        <li>날짜: {formatDate(conditions.date)}</li>
        <li>인원: {conditions.people === PEOPLE_MAX ? `${PEOPLE_MAX}명 이상` : `${conditions.people}명`}</li>
        <li>이동: {TRANSPORT_LABEL[conditions.transport]}</li>
        <li>함께: {together}</li>
      </ul>

      <p className="text-body text-text-sub">이 조건에 맞춘 코스는 준비 중이에요.</p>
    </div>
  )
}
