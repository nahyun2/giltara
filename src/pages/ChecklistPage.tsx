import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import ChecklistCard from '../components/ChecklistCard'
import Icon from '../components/Icon'
import { courses } from '../data/courses'
import { useChecklist } from '../hooks/useChecklist'
import { planCourse } from '../hooks/useCustomCourse'
import { formatDate, isComplete, parseConditions, toSearchParams } from '../hooks/useTripConditions'
import type { Course, Place } from '../types/course'
import type { CheckItem, TripConditions } from '../types/trip'

/** 가기 전 확인: 예약 필요 / 전화로 확인 / 그냥 가도 돼요 (#32) */
export default function ChecklistPage() {
  const { courseId } = useParams()
  const [params] = useSearchParams()
  const course = courses.find((c) => c.id === courseId)
  const conditions = useMemo(() => parseConditions(params), [params])

  if (!course) return <Navigate to="/" replace />
  if (!isComplete(conditions)) {
    return <Navigate to={`/course/${course.id}/plan?${toSearchParams(conditions, 5)}`} replace />
  }
  return <Checklist course={course} conditions={conditions} />
}

const CHECK_NOTE: Record<Exclude<CheckItem, 'rest'>, string> = {
  wheelchair: '휠체어로 다닐 수 있는지 (이용 정보가 없어요)',
  pet: '반려견과 함께 들어갈 수 있는지 (동반 정보가 없어요)',
}

type Item = { place: Place; number: number; notes: string[] }

function Checklist({ course, conditions }: { course: Course; conditions: TripConditions }) {
  const query = toSearchParams(conditions).toString()
  const plan = useMemo(() => planCourse(course, conditions), [course, conditions])
  const { isDone, toggle } = useChecklist(`${course.id}?${query}`)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [query])

  const items: Item[] = plan.places.map((place, i) => {
    const check = plan.checks.find((c) => c.place === place)
    const notes = (check?.items ?? []).map((it) => (it === 'rest' ? (check?.restNote ?? '') : CHECK_NOTE[it]))
    return { place, number: i + 1, notes: notes.filter(Boolean) }
  })

  const groups = [
    { id: 'reserve', title: '예약이 필요해요', items: items.filter((x) => x.place.visitInfo?.reservation) },
    {
      id: 'call',
      title: '전화로 확인해요',
      items: items.filter((x) => !x.place.visitInfo?.reservation && x.notes.length > 0),
    },
    {
      id: 'free',
      title: '그냥 가도 돼요',
      items: items.filter((x) => !x.place.visitInfo?.reservation && x.notes.length === 0),
    },
  ].filter((g) => g.items.length > 0)

  const doneCount = items.filter((x) => isDone(x.place.name)).length
  const allDone = doneCount === items.length

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
        <h1 className="text-screen-title font-bold text-text">가기 전에 확인해요</h1>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 gap-1.5" aria-hidden="true">
            {items.map((x) => (
              <span key={x.place.name} className={`h-2 flex-1 rounded-full ${isDone(x.place.name) ? 'bg-primary' : 'bg-chip'}`} />
            ))}
          </div>
          <p aria-live="polite" className="text-caption font-bold text-primary">
            {items.length}곳 중 {doneCount}곳 확인했어요
          </p>
        </div>
      </header>

      {allDone && (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-primary p-5 text-body font-bold text-on-color">
          <Icon name="check" className="size-6 shrink-0" />
          준비가 끝났어요! 즐거운 여행 되세요.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="flex flex-col gap-3">
          <h2 id={`group-${group.id}`} className="text-card-title font-bold text-text">
            {group.title} <span className="text-primary">{group.items.length}곳</span>
          </h2>
          {group.items.map((x) => (
            <ChecklistCard
              key={x.place.name}
              place={x.place}
              number={x.number}
              checkNotes={x.notes}
              done={isDone(x.place.name)}
              onToggle={() => toggle(x.place.name)}
            />
          ))}
        </section>
      ))}

      <p className="text-caption text-text-sub">
        이용 시간과 쉬는 날은 한국관광공사 정보예요. 바뀌었을 수 있으니 가기 전에 한 번 더 확인해 주세요.
      </p>
    </div>
  )
}
